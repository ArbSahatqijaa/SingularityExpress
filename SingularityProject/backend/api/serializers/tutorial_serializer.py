from rest_framework import serializers
from api.models import Tutorial  

class TutorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutorial
        fields = [
            'tutorial_id',
            'title',
            'filePath'
        ]
        read_only_fields = ['tutorial_id']

  