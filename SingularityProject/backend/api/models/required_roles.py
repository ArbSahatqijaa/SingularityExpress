from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
User = get_user_model()

ROLE_CHOICES = (
    # Common Engineering Roles
    ('ELECTRICAL_ENGINEER', 'Electrical Engineer'),
    ('MECHANICAL_ENGINEER', 'Mechanical Engineer'),
    ('SOFTWARE_ENGINEER', 'Software Engineer'),
    ('CHEMICAL_ENGINEER', 'Chemical Engineer'),
    ('CIVIL_ENGINEER', 'Civil Engineer'),
    ('INDUSTRIAL_ENGINEER', 'Industrial Engineer'),
    
    # Other STEM/Project roles
    ('ENGINEER', 'Engineer'),
    ('MATHEMATICIAN', 'Mathematician'),
    ('SCIENTIST', 'Scientist'),
    ('COLLABORATOR', 'Collaborator'),
    ('REVIEWER', 'Reviewer'),
    ('MENTOR', 'Mentor'),
    ('OBSERVER', 'Observer'),
    
    # Roles for research papers
    ('LEAD_AUTHOR', 'Lead Author'),
    ('CO_AUTHOR', 'Co-Author'),
    ('PAPER_REVIEWER', 'Paper Reviewer'),
    ('VIEWER', 'Viewer'),
)

class RequiredRoles(models.Model):
    required_roles_id = models.AutoField(primary_key=True)
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    quantity = models.PositiveIntegerField(default=1, help_text='Number of people required for this role')

    required_profession = models.CharField(
        max_length=100,
        blank=True, 
        null=True,
        help_text='Optional: specific professional title required'
    )

    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Required-Roles'
        verbose_name_plural = 'Required-Roles'

    def __str__(self):
        return f"{self.quantity} x {self.get_role_display()} for {self.content_object}"
