from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.user_project_serialzier import UserProjectSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.user_project import UserProject

class UserProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        user_projects = UserProject.objects.all()
        
        user = request.GET.get('user')
        project = request.GET.get('project')
        role = request.GET.get('role')
        
        if user:
            user_projects = user_projects.filter(user=user)
        if project:
            user_projects = user_projects.filter(project=project)
        if role:
            user_projects = user_projects.filter(role__iexact=role)
            
        serializer = UserProjectSerializer(user_projects, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = UserProjectSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class UserProjectDetailView(APIView):
    
    def get_object(self, pk):
        try:
            return UserProject.objects.get(pk=pk)
        except UserProject.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        user_project = self.get_object(pk)
        serializer = UserProjectSerializer(user_project)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        user_project = self.get_object(pk)
        serializer = UserProjectSerializer(user_project, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        user_project = self.get_object(pk)
        serializer = UserProjectSerializer(user_project, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        user_project = self.get_object(pk)
        user_project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
