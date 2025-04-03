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

    def create(self, validated_data):
        """
        Create and return a new Review instance.
        """
        return Review.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing Review instance.
        """
        for attr, value in validated_data.items(): 
            setattr(instance, attr, value)
        instance.save()
        return instance
"""""
    MUJM ME SHTU MA VON VARET SA NA DUHET KJO METODA
    def validate_rating(self, value):
        if not (1 <= value <= 5):  # Example: Assuming rating is between 1 and 5
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
"""