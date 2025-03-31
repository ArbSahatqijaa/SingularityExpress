from django.db import models

from django.contrib.auth import get_user_model
User = get_user_model()

VISIBILITY_CHOICES = (
    ('PUBLIC', 'Public'),
    ('PRIVATE', 'Private')
)

class Paper(models.Model):
    paper_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    visibility = models.CharField(
        choices=VISIBILITY_CHOICES,
        max_length=7,
        default='PUBLIC')
    file_path = models.FileField(
        upload_to='paper_files/'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_papers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

