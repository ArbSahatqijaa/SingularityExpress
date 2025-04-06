from django.core.management.base import BaseCommand
from api.models import Project
from django.contrib.auth import get_user_model
from faker import Faker
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with test project data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--total',
            type=int,
            default=10,
            help='Number of projects to create (default: 10)',
        )

    def handle(self, *args, **options):
        fake = Faker()
        total = options['total']

        leader = User.objects.first()
        creator = User.objects.last()

        if not leader or not creator:
            self.stdout.write(self.style.ERROR('❌ No users found. Please seed users first.'))
            return

        for _ in range(total):
            project = Project.objects.create(
                title=fake.sentence(nb_words=3),
                description=fake.text(max_nb_chars=200),
                visibility=random.choice(['PUBLIC', 'PRIVATE']),
                status=random.choice(['ACTIVE', 'COMPLETED']),
                leader=leader,
                created_by=creator
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Created project: {project.title}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Successfully seeded {total} projects!"))
