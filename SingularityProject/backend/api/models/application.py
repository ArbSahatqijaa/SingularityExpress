from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .paper import Paper
from .project import Project

User = get_user_model()

STATUS_CHOICES = (
     ('PENDING', 'Pending'),
    ('ACCEPTED', 'Accepted'),
    ('REJECTED', 'Rejected'),
)

class Application(models.Model):

    application_id = models.AutoField(primary_key=True)
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applied')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, null=True, blank=True)
    
    role_applied_for = models.CharField(max_length=50, blank=True)
    message = models.TextField(blank=True)

    cv = models.FileField(
        upload_to='project_files/',
        null=True,
        blank=True
    )
    status = models.CharField(
        choices= STATUS_CHOICES,
        max_length=8,
        default='PENDING'
    )  
    applied_at = models.DateField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if bool(self.project) == bool(self.paper):
            return ValidationError('Exactly one of project or paper must be set.')