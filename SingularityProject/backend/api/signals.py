from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models.paper import Paper
from api.models.user_paper import UserPaper
from api.models.project import Project
from api.models.user_project import UserProject


@receiver(post_save, sender=Paper)
def link_author(sender, instance, created, **kwargs):
    if created:
        UserPaper.objects.create(
            user=instance.created_by,
            paper=instance,
            role='AUTHOR'
        )

@receiver(post_save, sender=Project)
def link_creator(sender, instance, created, **kwargs):
    if created:
        UserProject.objects.create(
            user=instance.created_by,
            project=instance,
            role='CREATOR'
        )

