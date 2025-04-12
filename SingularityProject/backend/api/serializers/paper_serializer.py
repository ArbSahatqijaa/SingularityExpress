from rest_framework import serializers
from api.models import Paper

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

   