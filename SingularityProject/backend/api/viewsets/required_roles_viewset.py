from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models.required_roles import RequiredRoles  # Adjust the import path as needed
from serializers.required_roles_serializer import RequiredRolesSerializer  # Adjust the import path as needed

class RequiredRolesViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing RequiredRoles instances.
    """
    queryset = RequiredRoles.objects.all()
    serializer_class = RequiredRolesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter required roles based on content_type, object_id, role, or active status.
        """
        queryset = super().get_queryset()
        content_type = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        role = self.request.query_params.get('role')
        active = self.request.query_params.get('active')

        if content_type:
            queryset = queryset.filter(content_type__model=content_type.lower())
        if object_id:
            queryset = queryset.filter(object_id=object_id)
        if role:
            queryset = queryset.filter(role=role)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Customize the list action to return only active required roles by default.
        """
        queryset = self.get_queryset().filter(active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Customize the create action with additional logic if needed.
        """
        response = super().create(request, *args, **kwargs)
        # Add custom logic here, e.g., notify the creator, log role creation
        return response

    def retrieve(self, request, *args, **kwargs):
        """
        Customize the retrieve action with additional logic if needed.
        """
        response = super().retrieve(request, *args, **kwargs)
        # Add custom logic here, e.g., access logging
        return response

    def update(self, request, *args, **kwargs):
        """
        Customize the update action with additional logic if needed.
        """
        response = super().update(request, *args, **kwargs)
        # Add custom logic here, e.g., notify about changes
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Customize the destroy action with additional logic if needed.
        """
        instance = self.get_object()
        # Add logic here if soft delete is needed, or check for permissions
        return super().destroy(request, *args, **kwargs)
