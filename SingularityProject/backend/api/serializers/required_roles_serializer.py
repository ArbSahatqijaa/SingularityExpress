from rest_framework import serializers
from models import RequiredRoles

class RequiredRolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredRoles
        fields =[
            'required_roles_id',
            'content_type',
            'object_id',
            'content_object',
            'role',
            'quantity',
            'required_profession',
            'active'
        ]
        read_only_fields = ['required_roles_id']
        
    