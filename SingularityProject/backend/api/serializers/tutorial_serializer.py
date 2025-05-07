from rest_framework import serializers
from api.models import Tutorial  

class TutorialSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    class Meta:
        model = Tutorial
        fields = [
            'tutorial_id',
            'title',
            'created_by',
            'filePath'
        ]
        read_only_fields = ['tutorial_id']

  