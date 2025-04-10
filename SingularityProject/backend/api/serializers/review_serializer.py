from rest_framework import serializers
from models import Review  

class ReviewSerializer(serializers.ModelSerializer):
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
        ]

    def validate_rating(self, value):
        if not (1 <= value <=5):
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value

  