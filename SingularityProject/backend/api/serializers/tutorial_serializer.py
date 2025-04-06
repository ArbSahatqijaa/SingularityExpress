from rest_framework import serializers
from models import Tutorial  

class TutorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutorial
        fields = [
            'tutorial_id',
            'title',
            'filePath'
        ]
        read_only_fields = ['tutorial_id']

    def create(self, validated_data):
        """
        Create and return a new Tutorial instance.
        """
        return Tutorial.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing Tutorial instance.
        """
        for attr, value in validated_data.items():  
            setattr(instance, attr, value)
        instance.save()
        return instance