from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import Http404

from api.models.paper_project import PaperProject
from api.serializers.paper_project_serializer import PaperProjectSerializer


class PaperProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        paper_projects = PaperProject.objects.all()

        paper_id = request.GET.get('paper')
        project_id = request.GET.get('project')

        if paper_id:
            paper_projects = paper_projects.filter(paper__id=paper_id)
        if project_id:
            paper_projects = paper_projects.filter(project__id=project_id)

        serializer = PaperProjectSerializer(paper_projects, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = PaperProjectSerializer(data=request.data)

        if serializer.is_valid():
            # Auto-assign added_by as the currently authenticated user
            serializer.save(added_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaperProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

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
