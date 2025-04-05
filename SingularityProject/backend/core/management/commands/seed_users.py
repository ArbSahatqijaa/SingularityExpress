# core/management/commands/seed_users.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
import random

User = get_user_model()  # Retrieves your custom User model

fake = Faker()

class Command(BaseCommand):
    help = "Seed the database with test users"

    def add_arguments(self, parser):
        parser.add_argument(
            '--total',
            type=int,
            default=10,
            help='Number of users to create (default is 10)'
        )

    def handle(self, *args, **options):
        total = options['total']

        for _ in range(total):
            username = fake.user_name()
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = fake.unique.email()

            # Create user using the custom manager's create_user method
            user = User.objects.create_user(
                username=username,
                email=email,
                password="password123",  # Default password for seeded users
                first_name=first_name,
                last_name=last_name,
                role='USER',
            )

            self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
        
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {total} users"))
