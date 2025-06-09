from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models.paper import Paper
from api.models.user_paper import UserPaper
from api.models.project import Project
from api.models.user_project import UserProject
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
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

