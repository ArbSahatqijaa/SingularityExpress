from backend.api.models.friendship import Friendship
from rest_framework import serializers
class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = [
            'id', 'from_user', 'to_user', 'status',
            'created_at', 'updated_at', 'responded_at'
        ]
        read_only_fields = ['from_user', 'status']

    def create(self, validated_data):
        # Auto-set from_user to current user
        validated_data['from_user'] = self.context['request'].user
        return super().create(validated_data)