from ..models.friendship import Friendship
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    is_self = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['user_id', 'username', 'first_name', 'last_name', 'avatar', 'is_self']
    
    def get_is_self(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.id == request.user.id
        return False

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = [
            'id', 'from_user', 'to_user', 'status',
            'created_at', 'updated_at', 'responded_at'
        ]
        read_only_fields = ['from_user']

    def create(self, validated_data):
        # Auto-set from_user to current user
        validated_data['from_user'] = self.context['request'].user
        return super().create(validated_data)