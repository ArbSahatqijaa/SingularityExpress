from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
User = get_user_model()
class RequiredRoles(models.Model):
    required_roles_id = models.AutoField(primary_key=True)
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    role = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField(default=1, help_text='Number of people required for this role')

    details = models.TextField(
                         blank=True,
                         help_text="Describe skills, academic title, tools, etc which"
                         "          applicant's would need to have to apply for the certain roles.")
    
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = (
        ('content_type', 'object_id', 'role'),
    )

    def __str__(self):
        return f"{self.quantity}× {self.role} for {self.content_object}"