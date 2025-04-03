from rest_framework.response import Response  # Corrected import
from rest_framework import views
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models.user import User  # Adjust the import path as needed
from api.serializers.user_serializer import UserSerializer  # Adjust the import path as needed

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Restrict access to authenticated users

    def get_queryset(self):
        """
        Optionally filter users based on query parameters.
        """
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    def list(self, request, *args, **kwargs):
        """
        Customize the list action to return only active users.
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Customize the create action to add additional logic.
        """
        response = super().create(request, *args, **kwargs)
        # Add custom logic here, e.g., send a welcome email
        return response

    def retrieve(self, request, *args, **kwargs):
        """
        Customize the retrieve action to add additional logic.
        """
        response = super().retrieve(request, *args, **kwargs)
        # Add custom logic here, e.g., log access to user details
        return response

    def update(self, request, *args, **kwargs):
        """
        Customize the update action to add additional logic.
        """
        response = super().update(request, *args, **kwargs)
        # Add custom logic here, e.g., notify the user of profile updates
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Customize the destroy action to add additional logic.
        """
        instance = self.get_object()
        if instance.is_superuser:
            return Response({"error": "Cannot delete a superuser."}, status=400)
        return super().destroy(request, *args, **kwargs)