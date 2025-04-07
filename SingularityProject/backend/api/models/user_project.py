from django.db import models
from django.contrib.auth import get_user_model
from .project import Project

User = get_user_model()

ROLE_CHOICES = (
    ('COLLABORATOR', 'Collaborator'),
    ('REVIEWER', 'Reviewer'),
    ('MENTOR', 'Mentor'),
    ('OBSERVER', 'Observer')
)

class UserProject(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='project_roles' 
    )
    project = models.ForeignKey(Project, 
                                on_delete=models.CASCADE, 
                                related_name='project_users')
    role = models.CharField(
        max_length=12,
        choices=ROLE_CHOICES,
        default='OBSERVER'  
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'User-Project'
        verbose_name_plural = 'User-Project'
        unique_together = ('user', 'project')

    def __str__(self):
        return f"{self.user.username} - {self.project.title} ({self.role})"