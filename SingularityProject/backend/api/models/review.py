from django.db import models
from .paper import Paper
from .project import Project
from django.core.validators import MinValueValidator, MaxValueValidator

from django.contrib.auth import get_user_model
User = get_user_model()

class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviewed_projects')
    paper_reviewed = models.ForeignKey(Paper, on_delete=models.CASCADE, null=True, blank=True)
    project_reviewed = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.FloatField(validators=[ MinValueValidator(1.0), MaxValueValidator(5.0)])
    comment = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return f"Review {self.review_id} by {self.reviewer.username}"