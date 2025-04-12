from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from django.http import Http404

from api.models.required_roles import RequiredRoles
from api.serializers.required_roles_serializer import RequiredRolesSerializer


class RequiredRolesListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        required_roles = RequiredRoles.objects.all()

        model_name = request.GET.get('model')  # e.g., "project"
        object_id = request.GET.get('object_id')  # e.g., 1
        role = request.GET.get('role')

        if model_name and object_id:
            try:
                content_type = ContentType.objects.get(model=model_name.lower())
                required_roles = required_roles.filter(content_type=content_type, object_id=object_id)
            except ContentType.DoesNotExist:
                return Response({'error': 'Invalid model type'}, status=status.HTTP_400_BAD_REQUEST)

        if role:
            required_roles = required_roles.filter(role__iexact=role)

        serializer = RequiredRolesSerializer(required_roles, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = RequiredRolesSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequiredRolesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return RequiredRoles.objects.get(pk=pk)
        except RequiredRoles.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        role = self.get_object(pk)
        serializer = RequiredRolesSerializer(role)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        role = self.get_object(pk)
        serializer = RequiredRolesSerializer(role, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        role = self.get_object(pk)
        serializer = RequiredRolesSerializer(role, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        role = self.get_object(pk)
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    