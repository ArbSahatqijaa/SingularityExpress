# Generated by Django 5.1.7 on 2025-04-01 20:47

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Review',
            fields=[
                ('review_id', models.AutoField(primary_key=True, serialize=False)),
                ('rating', models.FloatField(validators=[django.core.validators.MinValueValidator(1.0), django.core.validators.MaxValueValidator(5.0)])),
                ('comment', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateField(auto_now=True)),
                ('paper_reviewed', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paper')),
                ('project_reviewed', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.project')),
                ('reviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviewed_projects', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
