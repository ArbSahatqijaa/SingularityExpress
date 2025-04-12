from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.project_serializer import ProjectSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.project import Project

class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        projects = Project.objects.all()
        
        title = request.GET.get('title')
        visibility = request.GET.get('visibility')
        status_filter = request.GET.get('status')
        leader = request.GET.get('leader')
        
        if title:
            projects = projects.filter(title__icontains=title)
        if visibility:
            projects = projects.filter(visibility__iexact=visibility)
        if status_filter:
            projects = projects.filter(status__iexact=status_filter)
        if leader:
            projects = projects.filter(leader=leader)
            
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = ProjectSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(created_by=request.user)  # <-- Required
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise Http404
            
    def get(self, request, pk, format=None):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        project = self.get_object(pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
