from rest_framework import serializers
from api.models import Tutorial
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username']  # use 'id' unless your User model uses 'user_id'

class TutorialSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)  # nested user object
    filePath = serializers.FileField(required=True)  # Accept file uploads

    class Meta:
        model = Tutorial
        fields = [
            'tutorial_id',
            'title',
            'created_by',
            'filePath',
        ]
        read_only_fields = ['tutorial_id', 'created_by']

    def to_representation(self, instance):
        """Override output to return full URL for filePath"""
        representation = super().to_representation(instance)
        request = self.context.get('request')

        if instance.filePath and hasattr(instance.filePath, 'url'):
            url = instance.filePath.url
            if request:
                url = request.build_absolute_uri(url)
            representation['filePath'] = url
        else:
            representation['filePath'] = None

        return representation
