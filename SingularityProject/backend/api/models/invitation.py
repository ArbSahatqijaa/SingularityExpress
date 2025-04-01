from django.db import models
from django.contrib.auth import get_user_model
from .project import Project
from .paper import Paper

User = get_user_model()

STATUS_CHOICES = (
     ('PENDING', 'Pending'),
    ('ACCEPTED', 'Accepted'),
    ('REJECTED', 'Rejected'),
)


class Invitation(models.Model):
    invitation_id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    project_invitation = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    paper_invitation = models.ForeignKey(Paper, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(
        choices= STATUS_CHOICES,
        max_length=8,
        default='PENDING'
    )         
    message = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"Invitation {self.invitation_id} "
            f"from {self.sender} to {self.receiver} "
            f"(Project: {self.project}, Paper: {self.paper}) "
            f"Status: {self.status}"
        )
    

        
    
    

