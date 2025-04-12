from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from api.models.required_roles import RequiredRoles

class RequiredRolesSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        slug_field='model',
        queryset=ContentType.objects.all()
    )

    class Meta:
        model = RequiredRoles
        fields = '__all__'
