from rest_framework import serializers
from api.models import Tutorial  

class TutorialSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    filePath = serializers.SerializerMethodField()  

    class Meta:
        model = Tutorial
        fields = [
            'tutorial_id',
            'title',
            'created_by',
            'filePath'
        ]
        read_only_fields = ['tutorial_id']

    def get_filePath(self, obj):
        request = self.context.get('request')
        if obj.filePath and hasattr(obj.filePath, 'url'):
            return request.build_absolute_uri(obj.filePath.url) if request else obj.filePath.url
        return None
