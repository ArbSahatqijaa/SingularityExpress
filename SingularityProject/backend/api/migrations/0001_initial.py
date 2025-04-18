# Generated by Django 5.1.7 on 2025-03-31 19:39

import api.models.user
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('user_id', models.AutoField(primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100, unique=True)),
                ('role', models.CharField(default='USER', max_length=50)),
                ('academic_title', models.CharField(blank=True, max_length=50, null=True)),
                ('profession', models.CharField(blank=True, max_length=100, null=True)),
                ('refresh_token', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', api.models.user.CustomUserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Paper',
            fields=[
                ('paper_id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=255)),
                ('visibility', models.CharField(choices=[('PUBLIC', 'Public'), ('PRIVATE', 'Private')], default='PUBLIC', max_length=7)),
                ('file_path', models.FileField(upload_to='paper_files/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_papers', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('project_id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=255)),
                ('visibility', models.CharField(choices=[('PUBLIC', 'Public'), ('PRIVATE', 'Private')], default='PUBLIC', max_length=7)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('COMPLETED', 'Completed')], default='ACTIVE', max_length=9)),
                ('file_path', models.FileField(blank=True, null=True, upload_to='project_files/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_projects', to=settings.AUTH_USER_MODEL)),
                ('leader', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='led_projects', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PaperProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.CharField(blank=True, max_length=255, null=True)),
                ('added_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paper_project_additions', to=settings.AUTH_USER_MODEL)),
                ('paper', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_links', to='api.paper')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paper_links', to='api.project')),
            ],
            options={
                'verbose_name': 'Paper-Project',
                'verbose_name_plural': 'Paper-Project',
                'unique_together': {('paper', 'project')},
            },
        ),
        migrations.CreateModel(
            name='UserPaper',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('AUTHOR', 'Author'), ('CO_AUTHOR', 'Co-Author'), ('REVIEWER', 'Reviewer'), ('VIEWER', 'Viewer')], default='VIEWER', max_length=10)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('paper', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paper_users', to='api.paper')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_papers', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User-Paper',
                'verbose_name_plural': 'User-Paper',
                'unique_together': {('user', 'paper')},
            },
        ),
        migrations.CreateModel(
            name='UserProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('COLLABORATOR', 'Collaborator'), ('REVIEWER', 'Reviewer'), ('MENTOR', 'Mentor'), ('OBSERVER', 'Observer')], default='OBSERVER', max_length=12)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_roles', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User-Project',
                'verbose_name_plural': 'User-Project',
                'unique_together': {('user', 'project')},
            },
        ),
    ]
