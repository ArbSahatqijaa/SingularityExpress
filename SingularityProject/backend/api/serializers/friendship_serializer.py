from rest_framework import serializers
from api.models import Friendship

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = [
            'id',
            'from_user',
            'to_user',
            'status',
            'created_at',
            'updated_at',
            'responded_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
            ]

   