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
        
    def create(self, validated_data):
        """
        Create and return a new RequiredRoles instance.
        """
        return RequiredRoles.objects.create(**validated_data)   
    
    def update(self, instance, validated_data):
        """
        Update and return an existing RequiredRoles instance.
        """
        for attr, value in validated_data.items():  
            setattr(instance, attr, value)
        instance.save()
        return instance