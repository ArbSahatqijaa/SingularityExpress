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
        
        # Get user details with all necessary fields
        from_user_details = {
            'user_id': instance.from_user.user_id,
            'first_name': instance.from_user.first_name,
            'last_name': instance.from_user.last_name,
            'username': instance.from_user.username,
            'avatar': instance.from_user.avatar.url if instance.from_user.avatar else None,
            'profession': instance.from_user.profession,
            'academic_title': instance.from_user.academic_title
        }
        
        to_user_details = {
            'user_id': instance.to_user.user_id,
            'first_name': instance.to_user.first_name,
            'last_name': instance.to_user.last_name,
            'username': instance.to_user.username,
            'avatar': instance.to_user.avatar.url if instance.to_user.avatar else None,
            'profession': instance.to_user.profession,
            'academic_title': instance.to_user.academic_title
        }
        
        # Prepare the notification data with consistent structure
        notification_data = {
            'type': 'broadcast.friendship',
            'action': 'friendship_request_sent' if created else f'friendship_request_{instance.status.lower()}',
            'friendship_id': instance.id,
            'from_user': instance.from_user.user_id,
            'to_user': instance.to_user.user_id,
            'from_user_details': from_user_details,
            'to_user_details': to_user_details,
            'status': instance.status,
            'timestamp': instance.created_at.isoformat() if created else instance.updated_at.isoformat(),
            'responded_at': instance.responded_at.isoformat() if instance.responded_at else None
        }

        # Send to both users with proper error handling
        for user_id in [instance.to_user.user_id, instance.from_user.user_id]:
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{user_id}",
                    notification_data
                )
                logger.info(f"Successfully sent friendship event to user {user_id}: {notification_data['action']}")
            except Exception as e:
                logger.error(f"Failed to send friendship event to user {user_id}: {str(e)}", exc_info=True)

    except Exception as e:
        logger.error(f"Error in friendship signal handler: {str(e)}", exc_info=True)

@receiver(post_delete, sender=Friendship)
def friendship_deleted(sender, instance, **kwargs):
    """Broadcast friendship deletion events."""
    try:
        channel_layer = get_channel_layer()
        
        # Get user details before deletion
        from_user_details = {
            'user_id': instance.from_user.user_id,
            'first_name': instance.from_user.first_name,
            'last_name': instance.from_user.last_name,
            'username': instance.from_user.username
        }
        
        to_user_details = {
            'user_id': instance.to_user.user_id,
            'first_name': instance.to_user.first_name,
            'last_name': instance.to_user.last_name,
            'username': instance.to_user.username
        }
        
        notification_data = {
            'type': 'broadcast.friendship',
            'action': 'friendship_deleted',
            'friendship_id': instance.id,
            'from_user': instance.from_user.user_id,
            'to_user': instance.to_user.user_id,
            'from_user_details': from_user_details,
            'to_user_details': to_user_details,
            'status': 'DELETED',
            'timestamp': instance.updated_at.isoformat()
        }

        # Notify both users with proper error handling
        for user_id in [instance.from_user.user_id, instance.to_user.user_id]:
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{user_id}",
                    notification_data
                )
                logger.info(f"Successfully sent friendship deletion to user {user_id}")
            except Exception as e:
                logger.error(f"Failed to send friendship deletion to user {user_id}: {str(e)}", exc_info=True)

    except Exception as e:
        logger.error(f"Error in friendship deletion signal handler: {str(e)}", exc_info=True)

