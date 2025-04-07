from rest_framework import serializers
from models import Paper

class PaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paper
        fields = [
            'paper_id',
            'title',
            'description',
            'visibility',
            'status',
            'file_path',
            'created_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'paper_id',
            'created_by',
            'created_at',
            'updated_at'
        ]

    def create(self, validated_data):
        return Paper.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance