from django.db import models

from django.contrib.auth import get_user_model
User = get_user_model()

VISIBILITY_CHOICES = (
    ('PUBLIC', 'Public'),
    ('PRIVATE', 'Private')
)

STATUS_CHOICES = (
    ('ACTIVE', 'Active'),
    ('COMPLETED', 'Completed')
)

class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    visibility = models.CharField(
        max_length=7,
        choices=VISIBILITY_CHOICES,
        default='PUBLIC'
    )
    status = models.CharField(
        max_length=9,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )
    file_path = models.FileField(
        upload_to='project_files/',
        null=True,
        blank=True
    )
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='led_projects')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title