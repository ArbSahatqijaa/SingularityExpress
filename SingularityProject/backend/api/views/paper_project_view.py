from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.paper_project_serializer import PaperProjectSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.paper_project import PaperProject

class PaperProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        paper_projects = PaperProject.objects.all()
        
        paper = request.GET.get('paper')
        project = request.GET.get('project')
        
        if paper:
            paper_projects = paper_projects.filter(paper=paper)
        if project:
            paper_projects = paper_projects.filter(project=project)
            
        serializer = PaperProjectSerializer(paper_projects, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = PaperProjectSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class PaperProjectDetailView(APIView):
    
    def get_object(self, pk):
        try:
            return PaperProject.objects.get(pk=pk)
        except PaperProject.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        paper_project = self.get_object(pk)
        serializer = PaperProjectSerializer(paper_project)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        paper_project = self.get_object(pk)
        serializer = PaperProjectSerializer(paper_project, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        paper_project = self.get_object(pk)
        serializer = PaperProjectSerializer(paper_project, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        paper_project = self.get_object(pk)
        paper_project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
