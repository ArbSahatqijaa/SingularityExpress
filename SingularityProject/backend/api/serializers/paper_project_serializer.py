from rest_framework import serializers
from api.models import Paper, PaperProject, Project
from .project_serializer import ProjectSerializer
from .paper_serializer import PaperSerializer

from django.contrib.auth import get_user_model
User = get_user_model()

class PaperProjectSerializer(serializers.ModelSerializer):
    
    paper = PaperSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)

    paper_id = serializers.PrimaryKeyRelatedField(
        source='paper',
        queryset=Paper.objects.all(),
        write_only=True
    )
    project_id = serializers.PrimaryKeyRelatedField(
        source='project',
        queryset=Project.objects.all(),
        write_only=True
    )

    added_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    class Meta:
        model = PaperProject
        fields = ['paper', 'project','paper_id', 'project_id', 'added_by', 'added_at', 'notes' ]

        read_only_fields = ['added_at']

