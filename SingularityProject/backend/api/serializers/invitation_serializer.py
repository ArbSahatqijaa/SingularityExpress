from rest_framework import serializers
from api.models import Invitation

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
        
   
            