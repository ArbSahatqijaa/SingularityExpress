from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models.paper import Paper
from api.models.user_paper import UserPaper
from api.models.project import Project
from api.models.user_project import UserProject
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models.friendship import Friendship
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@receiver(post_save, sender=Paper)
def link_author(sender, instance, created, **kwargs):
    if created:
        UserPaper.objects.create(
            user=instance.created_by,
            paper=instance,
            role='AUTHOR'
        )

@receiver(post_save, sender=Project)
def link_creator(sender, instance, created, **kwargs):
    if created:
        logger.info(f"New project created: {instance.title} (ID: {instance.project_id})")
        logger.info(f"Project details: visibility={instance.visibility}, status={instance.status}, created_by={instance.created_by.username}")
        
        # Create UserProject entry for creator
        try:
            UserProject.objects.create(
                user=instance.created_by,
                project=instance,
                role='CREATOR'
            )
            logger.info(f"Created UserProject entry for creator {instance.created_by.username}")
        except Exception as e:
            logger.error(f"Error creating UserProject entry: {str(e)}")
        
        # Broadcast new project to all connected clients
        try:
            channel_layer = get_channel_layer()
            logger.info("Getting channel layer for WebSocket broadcast")
            
            project_data = {
                'project_id': instance.project_id,
                'title': instance.title,
                'description': instance.description,
                'visibility': instance.visibility,
                'status': instance.status,
                'created_at': instance.created_at.isoformat(),
                'leader': {
                    'user_id': instance.leader.user_id,
                    'username': instance.leader.username
                },
                'created_by': {
                    'user_id': instance.created_by.user_id,
                    'username': instance.created_by.username
                }
            }
            logger.info(f"Preparing to broadcast project data: {project_data}")
            
            async_to_sync(channel_layer.group_send)('lobby', {
                'type': 'broadcast.project',
                'action': 'new_project',
                'project': project_data
            })
            logger.info("Successfully broadcast new project to lobby group")
        except Exception as e:
            logger.error(f"Error broadcasting new project: {str(e)}", exc_info=True)

@receiver(post_save, sender=Friendship)
def friendship_created_updated(sender, instance, created, **kwargs):
    """Broadcast friendship events to relevant users via WebSocket."""
    try:
        channel_layer = get_channel_layer()
        
        # Prepare the notification data
        notification_data = {
            'type': 'broadcast.friendship',
            'action': 'friendship_request_sent' if created else f'friendship_request_{instance.status.lower()}',
            'friendship_id': instance.id,
            'from_user': instance.from_user.user_id,
            'to_user': instance.to_user.user_id,
            'status': instance.status,
            'timestamp': instance.created_at.isoformat() if created else instance.updated_at.isoformat()
        }

        # Send to the recipient's channel
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.to_user.user_id}",
            notification_data
        )

        # If it's an update (accept/reject), also notify the sender
        if not created:
            async_to_sync(channel_layer.group_send)(
                f"user_{instance.from_user.user_id}",
                notification_data
            )

        logger.info(f"Broadcast friendship event: {notification_data}")
    except Exception as e:
        logger.error(f"Error broadcasting friendship event: {str(e)}", exc_info=True)

@receiver(post_delete, sender=Friendship)
def friendship_deleted(sender, instance, **kwargs):
    """Broadcast friendship deletion events."""
    try:
        channel_layer = get_channel_layer()
        
        notification_data = {
            'type': 'broadcast.friendship',
            'action': 'friendship_deleted',
            'friendship_id': instance.id,
            'from_user': instance.from_user.user_id,
            'to_user': instance.to_user.user_id,
            'timestamp': instance.updated_at.isoformat()
        }

        # Notify both users
        for user_id in [instance.from_user.user_id, instance.to_user.user_id]:
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                notification_data
            )

        logger.info(f"Broadcast friendship deletion: {notification_data}")
    except Exception as e:
        logger.error(f"Error broadcasting friendship deletion: {str(e)}", exc_info=True)

