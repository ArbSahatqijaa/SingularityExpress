from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Message(models.Model):
    messageID = models.CharField(max_length=100, primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    conversation = models.ForeignKey('Conversation', on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"

    class Meta:
        managed = False
