from rest_framework import serializers
from models import Friendship

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = [
            'from_user',
            'to_user',
            'status',
            'created_at',
            'updated_at',
            'responded_at',
        ]

   