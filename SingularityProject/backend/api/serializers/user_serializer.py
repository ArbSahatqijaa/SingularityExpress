from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id',
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'academic_title',
            'profession',
            'refresh_token',
            'created_at',
            'updated_at',
            'is_active',
            'is_staff',
            'is_superuser'
        ]
        read_only_fields = [
            'user_id',
            'created_at',
            'updated_at',
            'is_staff',
            'is_superuser'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'refresh_token': {'write_only': True}
        }   

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance