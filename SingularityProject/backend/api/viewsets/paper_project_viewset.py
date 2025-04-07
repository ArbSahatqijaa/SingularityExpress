from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models import PaperProject
from serializers.paper_project_serializer import PaperProjectSerializer

class PaperProjectViewSet(viewsets.ModelViewSet):

    queryset = PaperProject.objects.all()
    serializer_class = PaperProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = super().get_queryset() 
        paper_id = self.request.query_params.get('paper_id')
        project_id = self.request.query_params.get('project_id')

        if paper_id:
            queryset = queryset.filter(paper__paper_id=paper_id)
        if project_id:
            queryset = queryset.filter(project__project_id=project_id)

        return queryset