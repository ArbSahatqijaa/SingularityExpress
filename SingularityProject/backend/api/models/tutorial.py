from django.db import models

from django.contrib.auth import get_user_model
User = get_user_model()

class Tutorial(models.Model):
    tutorial_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    filePath = models.FileField(
        upload_to='tutorial_files'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tutorials')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'Tutorial: ' + self.title + '- Crated by: ' + self.created_by.username