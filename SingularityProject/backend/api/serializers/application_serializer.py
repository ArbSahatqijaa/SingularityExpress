from rest_framework import serializers
from django.core.exceptions import ValidationError
from api.models.application import Application
from django.contrib.auth import get_user_model

User = get_user_model()

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.PrimaryKeyRelatedField(read_only=True)  # applicant is auto-set from request.user

    class Meta:
        model = Application
        fields = [
            'application_id',
            'applicant',
            'project',
            'paper',
            'role_applied_for',
            'message',
            'cv',
            'status',
            'applied_at',
            'reviewed_at',
        ]
        read_only_fields = ['application_id', 'applied_at', 'reviewed_at']

    def validate(self, data):
        project = data.get('project')
        paper = data.get('paper')

        if bool(project) == bool(paper):
            raise serializers.ValidationError("Exactly one of 'project' or 'paper' must be set.")
        return data

    def create(self, validated_data):
        # Set the applicant to the user making the request
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)
