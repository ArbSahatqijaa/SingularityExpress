from django.core.management.base import BaseCommand
from api.models import Project
from django.contrib.auth import get_user_model
from faker import Faker
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with test project data'

    def handle(self, *args, **kwargs):
        fake = Faker()

        # You can filter for an existing user or create one for test
        leader = User.objects.first()
        creator = User.objects.last()

        if not leader or not creator:
            self.stdout.write(self.style.ERROR('No users found. Please create users first.'))
            return

        for _ in range(10):
            Project.objects.create(
                title=fake.sentence(nb_words=3),
                description=fake.text(max_nb_chars=200),
                visibility=random.choice(['PUBLIC', 'PRIVATE']),
                status=random.choice(['ACTIVE', 'COMPLETED']),
                leader=leader,
                created_by=creator
            )

        self.stdout.write(self.style.SUCCESS('✅ Successfully seeded Project data.'))
