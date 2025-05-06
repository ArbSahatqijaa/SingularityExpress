from rest_framework import serializers
from api.models import User
from api.models import Project

class ProjectSerializer(serializers.ModelSerializer):
    leader = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Project
        fields = [
            'project_id',
            'title',
            'description',
            'visibility',
            'status',
            'file_path',
            'leader',
            'created_by',
            'created_at',
            'updated_at'
        ] 
        read_only_fields = [
            'project_id',
            'created_by',
            'created_at',
            'updated_at'
            ]