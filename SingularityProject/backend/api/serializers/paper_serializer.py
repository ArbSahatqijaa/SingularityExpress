from rest_framework import serializers
from api.models import Paper

from rest_framework.fields import CurrentUserDefault
from django.contrib.auth import get_user_model
from api.models.user_paper import UserPaper

User = get_user_model()
class PaperSerializer(serializers.ModelSerializer):
   
    created_by = serializers.HiddenField(default=CurrentUserDefault())
    authors = serializers.SerializerMethodField(read_only=True)
    my_role = serializers.SerializerMethodField(read_only=True)

    role_details = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    accepting_applications = serializers.BooleanField()
    file_path = serializers.FileField()
   
    class Meta:
        model = Paper
        fields = [
            'paper_id',
            'title',
            'description',
            'visibility',
            'status',
            'accepting_applications',
            'file_path',
            'role_details',
            'authors',
            'my_role',
            'created_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'paper_id',
            'authors',
            'my_role',
            'created_by',
            'created_at',
            'updated_at'
        ]

    def get_my_role(self, obj):
        
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return ''
        rel = UserPaper.objects.filter(user=request.user, paper=obj).first()
        return rel.role if rel else ''


    def get_authors(self, obj):
        """
        Return a list of “First Last” (plus academic_title if present) for every row in
        UserPaper where role='AUTHOR' for this Paper.
        """
        userpapers = UserPaper.objects.filter(paper=obj, role='AUTHOR').select_related('user')
        names = []
        for up in userpapers:
            user = up.user
            parts = []
            academic_title = getattr(user, 'academic_title', None)
            if academic_title and academic_title.strip():
                parts.append(academic_title.strip())
            if user.first_name:
                parts.append(user.first_name)
            if user.last_name:
                parts.append(user.last_name)
            # fallback: if the user has no name fields, use their username
            if not parts:
                parts.append(user.username)
            names.append(' '.join(parts))
        return names

    def validate(self, attrs):
        if attrs.get('accepting_applications') and not attrs.get('role_details', '').strip():
            raise serializers.ValidationError({
                'role_details': 'Please describe the role if you are accepting applications.'
            })
        return super().validate(attrs)

    