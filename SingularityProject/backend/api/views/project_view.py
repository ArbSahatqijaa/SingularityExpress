from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.project_serializer import ProjectSerializer
from rest_framework.permissions import IsAuthenticated
from api.models.project import Project
from rest_framework.parsers import MultiPartParser, FormParser

class ProjectListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    
    def get(self, request, format=None):
        projects = Project.objects.all()
        
        # Filter projects by query parameters
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
            
        serializer = ProjectSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request, format=None):
        # Handle file uploads correctly with `request.FILES`
        serializer = ProjectSerializer(data=request.data, context={'request': request})
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
class ProjectDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]


    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise Http404
            
    def get(self, request, pk, format=None):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project, context={'request': request})
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        project = self.get_object(pk)
        

        if not (
            request.user == project.leader
            or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        new_leader = request.data.get('leader', None)

        if new_leader is not None:
            if not (
                request.user == project.leader
                or request.user.is_staff
                or request.user.is_superuser
            ):
                return Response(
                    {"detail": "Only the current leader, staff, or superuser may reassign leadership."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ProjectSerializer(project, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        project = self.get_object(pk)

        if not (
            request.user == project.leader
            or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProjectSerializer(project, data=request.data, partial=True, context={'request':request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        project = self.get_object(pk)

        if not (
            request.user == project.leader
            or request.user.is_staff
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
