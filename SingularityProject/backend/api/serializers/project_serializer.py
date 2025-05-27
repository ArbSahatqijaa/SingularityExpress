from rest_framework import serializers
from api.models import Project
from rest_framework.fields import CurrentUserDefault
from django.contrib.auth import get_user_model

User = get_user_model()
class ProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(
        default=CurrentUserDefault()
    )

    leader = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=CurrentUserDefault(),
        required=False
    )
    role_details = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    accepting_applications = serializers.BooleanField()

    file_path = serializers.FileField()
    image = serializers.ImageField(required=False, allow_null=True)
    

    class Meta:
        model = Project
        fields = [
            'project_id',
            'title',
            'description',
            'visibility',
            'status',
            'accepting_applications',
            'file_path',
            'leader',
            'image',
            'role_details',
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
        user = self.context['request'].user
        validated_data.setdefault('leader', user)
        return super().create(validated_data)
    
    def validate(self, attrs):
        if attrs.get('accepting_applications') and not attrs.get('role_details', '').strip():
            raise serializers.ValidationError({
                'role_details': 'Please describe the role if you are accepting applications.'
            })
        return super().validate(attrs)