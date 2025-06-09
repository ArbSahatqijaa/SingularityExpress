from django.urls import re_path

from .consumers import CallConsumer

websocket_urlpatterns = [
    re_path(r"^ws/chat/$", CallConsumer.as_asgi()),
    re_path(r"^ws/communication/$", CallConsumer.as_asgi()),  # Keep this for backward compatibility
] 