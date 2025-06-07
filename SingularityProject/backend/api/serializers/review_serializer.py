from rest_framework import serializers
from api.models import Review  
from django.contrib.auth import get_user_model
User = get_user_model()

class ReviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username']  # Add other fields if needed

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = ReviewerSerializer(read_only=True)  # <-- nested serializer

    class Meta:
        model = Review
        fields = [
            'review_id',
            'reviewer',
            'paper_reviewed',
            'project_reviewed',
            'rating',
            'comment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'review_id',
            'created_at',
            'updated_at',
            'reviewer',
        ]

    def validate_rating(self, value):
        if not (1 <= value <=5):
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value

  