from rest_framework import serializers
from api.models import Project
from rest_framework.fields import CurrentUserDefault
from django.contrib.auth import get_user_model
from api.models.user_project import UserProject

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username']  

class ProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(
        default=CurrentUserDefault()
    )
    created_by_info = UserSerializer(source='created_by', read_only=True)

    leader = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=CurrentUserDefault(),
        required=False
    )

    leader_name = serializers.SerializerMethodField(read_only=True)
    my_role = serializers.SerializerMethodField(read_only=True)

    role_details = serializers.CharField(required=False, allow_blank=True)
    worker_count = serializers.IntegerField(read_only=True)
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
            'leader_name',
            'image',
            'my_role',
            'role_details',
            'worker_count',
            'created_by',
            'created_by_info',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'project_id',
            'created_by',
            'created_at',
            'updated_at'
        ]

    def get_leader_name(self, obj):
        user = obj.leader
        if not user:
            return ''

        parts = []

        academic_title = getattr(user, 'academic_title', None)
        if academic_title and academic_title.strip():
            parts.append(academic_title.strip())

        if user.first_name:
            parts.append(user.first_name)
        if user.last_name:
            parts.append(user.last_name)

        return ' '.join(parts)
    
    def get_my_role(self, obj):
        req = self.context.get('request')
        if not req or req.user.is_anonymous:
            return ''
        rel = UserProject.objects.filter(user=req.user, project=obj).first()
        return rel.role if rel else ''

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
