from django.db import models
from django.contrib.auth import get_user_model
from .paper import Paper
from .project import Project

User = get_user_model()

class PaperProject(models.Model):
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name='project_links')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='paper_links')
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paper_project_additions')
    added_at = models.DateTimeField(auto_now_add=True)
    notes = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = 'Paper-Project'
        verbose_name_plural = 'Paper-Project'
        unique_together = ('paper', 'project')

    def __str__(self):
        return f"{self.paper.title} in {self.project.title}"