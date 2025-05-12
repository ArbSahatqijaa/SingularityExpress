from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

@receiver(post_save, sender=User)
def user_created_updated(sender, instance, created, **kwargs):
    """Broadcast user list update or new user event to lobby group."""
    channel_layer = get_channel_layer()
    if created:
        # Send only new user data
        payload = {
            'type': 'broadcast.users',
            'event': 'user_created',
            'user': {
                'id': instance.user_id,
                'username': instance.username,
            }
        }
    else:
        # update event
        payload = {
            'type': 'broadcast.users',
            'event': 'user_updated',
            'user': {
                'id': instance.user_id,
                'username': instance.username,
            }
        }
    async_to_sync(channel_layer.group_send)('lobby', payload) 