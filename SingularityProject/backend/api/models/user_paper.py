from django.db import models
from django.contrib.auth import get_user_model
from .paper import Paper

User = get_user_model()

ROLE_CHOICES = (
    ('AUTHOR', 'Author'),
    ('CO_AUTHOR', 'Co-Author'),  
    ('REVIEWER', 'Reviewer'),
    ('VIEWER', 'Viewer'),
)

class UserPaper(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='user_papers'
    )
    paper = models.ForeignKey(
        Paper, 
        on_delete=models.CASCADE, 
        related_name='paper_users'
    )
    role = models.CharField(
        max_length=10,  
        choices=ROLE_CHOICES,
        default='VIEWER'
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'User-Paper'
        verbose_name_plural = 'User-Paper'
        unique_together = ('user', 'paper')

    def __str__(self):
        return f"{self.user.username} - {self.paper.title} ({self.role})"