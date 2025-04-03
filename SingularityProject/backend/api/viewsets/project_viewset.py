from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models.project import Project  
from serializers.project_serializer import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optionally filter projects based on query parameters.
        """
        queryset = super().get_queryset()
        visibility = self.request.query_params.get('visibility')
        status = self.request.query_params.get('status')
        if visibility:
            queryset = queryset.filter(visibility=visibility)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        request.data['created_by'] = request.user.id
        response = super().create(request, *args, **kwargs)
        response.data['message'] = f"Project '{response.data['title']}' created successfully!"
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """
        Customize the retrieve action to include additional details.
        """
        response = super().retrieve(request, *args, **kwargs)
        response.data['extra_info'] = "This is additional information about the project."
        return response
    
    def update(self, request, *args, **kwargs):
        """
        Customize the update action to prevent changes to the created_by field.
        """
        if 'created_by' in request.data:
            request.data.pop('created_by')  # Prevent modification of the created_by field
        response = super().update(request, *args, **kwargs)
        response.data['message'] = f"Project '{response.data['title']}' updated successfully!"
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Customize the destroy action to prevent deletion of completed projects.
        """
        instance = self.get_object()
        if instance.status == 'COMPLETED':
            return Response({"error": "Cannot delete a completed project."}, status=400)
        return super().destroy(request, *args, **kwargs)