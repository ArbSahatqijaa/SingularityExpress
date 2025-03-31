from django.db import models
from .project import Project

from django.contrib.auth import get_user_model
User = get_user_model()

ROLE_CHOICES = (
    ('COLLABORATOR', 'Collaborator'),
    ('REVIEWER', 'Reviewer'),
    ('MENTOR', 'Mentor'),
    ('OBSERVER', 'Observer')
)

class UserProject(models.Model):
    user_project_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.CharField(max_length=12,
                            choices=ROLE_CHOICES,
                            default='COLLABORATOR')
    
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} - {self.project_id} ({self.role})"