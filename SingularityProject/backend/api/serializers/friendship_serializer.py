from ..models.friendship import Friendship, STATUS_CHOICES
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .user_serializer import UserSerializer

User = get_user_model()

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    
    to_user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )

    to_user_details = UserSerializer(source='to_user', read_only=True)

    status = serializers.ChoiceField(
        choices=STATUS_CHOICES,
        default='PENDING',
        required=False
    )

    class Meta:
        model = Friendship
        fields = [
            'id', 
            'from_user',
            'to_user', 
            'to_user_details',
            'status',
            'created_at', 
            'updated_at', 
            'responded_at'
        ]
        read_only_fields = ['id','from_user','created_at','updated_at','responded_at']

    def create(self, validated_data):
        # Auto-set from_user to current user
        validated_data['from_user'] = self.context['request'].user
        return super().create(validated_data)