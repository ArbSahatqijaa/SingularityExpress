from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.fields import ImageField

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    is_self = serializers.SerializerMethodField()
   
    avatar = serializers.ImageField(required=False, allow_null=True)
    cover = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'user_id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'role',
            'academic_title',
            'profession',
            'refresh_token',
            'avatar',
            'cover',
            'is_self',
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
            'is_active',
            'is_superuser',
            'is_self'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'refresh_token': {'write_only': True}
        }

    def create(self, validated_data):
        avatar = validated_data.pop('avatar', None)
        cover = validated_data.pop('cover', None)
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)

        user.avatar = avatar
        user.cover = cover

        user.save()
        return user

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)
        cover = validated_data.pop('cover', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if avatar:
            instance.avatar = avatar
        if cover:
            instance.cover = cover

        instance.save()
        return instance
    
    def get_is_self(self, obj):
        req = self.context.get('request', None)
        
        if not req or not hasattr(req, 'user'):
            return False
        return req.user.user_id == obj.user_id
