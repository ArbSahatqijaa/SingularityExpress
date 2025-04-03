from rest_framework import serializers
from models import Project

class ProjectSerializer(serializers.ModelSerializer):
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
        
        def create(self, validated_data):
            return Project.objects.create(**validated_data)
        
        def update (self, instance, validated_data):
            for attr, value in validated_data():
                setattr(instance, attr, value)
                instance.save()
            return instance