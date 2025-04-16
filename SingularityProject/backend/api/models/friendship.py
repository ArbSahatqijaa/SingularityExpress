from django.db import models
from django.db.models import Q, F, CheckConstraint, UniqueConstraint
from django.contrib.auth import get_user_model

User = get_user_model()

STATUS_CHOICES = (
    ('PENDING', 'Pending'),
    ('ACCEPTED', 'Accepted'),
    ('REJECTED', 'Rejected'),
    ('BLOCKED', 'Blocked')
)


class Friendship(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='send_friend_requests')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_friend_requests')
    status = models.CharField(choices=STATUS_CHOICES, max_length=8)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Friends'
        constraints = [
            UniqueConstraint(fields=['from_user', 'to_user'], name='unique_friendship'),
            CheckConstraint(
                check=~Q(from_user=F('to_user')),  # Ensure that the 'from_user' and 'to_user' are not the same
                name='prevent_self_friendship'
            ),
        ]
        verbose_name = 'Friendship'
        verbose_name_plural = 'Friendships'

    def __str__(self):
        return f"{self.from_user} -> {self.to_user} [{self.status}]"
