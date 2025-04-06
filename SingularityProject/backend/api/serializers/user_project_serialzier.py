from rest_framework import serializers
from models import UserProject, Project
from project_serializer import ProjectSerializer
from user_serializer import UserSerializer

from django.contrib.auth import get_user_model
User = get_user_model()

class UserProjectSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only = True)

    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        write_only=True
    )
    project_id = serializers.PrimaryKeyRelatedField(
        source='project',
        queryset=Project.objects.all(),
        write_only=True
    )


    class Meta:
        model = UserProject
        fields = ['user', 'project','user_id', 'project_id','role', 'joined_at']
        read_only_fields = ['joined_at']

