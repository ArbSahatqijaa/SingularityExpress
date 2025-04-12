from rest_framework import serializers
from api.models import UserPaper, Paper
from .paper_serializer import PaperSerializer
from .user_serializer import UserSerializer

from django.contrib.auth import get_user_model
User = get_user_model()

class UserPaperSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    paper = PaperSerializer(read_only=True)

    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all(),
        write_only=True
    )
    paper_id = serializers.PrimaryKeyRelatedField(
        source='paper',
        queryset=Paper.objects.all(),
        write_only=True
    )

    class Meta:
        model = UserPaper
        fields = ['user', 'paper', 'user_id', 'paper_id', 'role', 'joined_at']
        read_only_fields = ['joined_at']