from rest_framework import serializers
from models import Invitation

class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields =[
            'invitation_id',
            'sender',
            'receiver',
            'project_invitation',
            'paper_invitation',
            'status',
            'message',
            'created_at',
            'updated_at'
        ]
        
    def create(self, validated_data):
        return Invitation.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
            