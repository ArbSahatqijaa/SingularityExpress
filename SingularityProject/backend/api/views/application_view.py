from rest_framework import generics, permissions
from api.models.application import Application
from api.serializers.application_serializer import ApplicationSerializer

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.all() if user.is_staff else Application.objects.filter(applicant=user)

        # Optional filters
        project_id = self.request.query_params.get('project_id')
        paper_id = self.request.query_params.get('paper_id')

        if project_id:
            queryset = queryset.filter(project__id=project_id)
        if paper_id:
            queryset = queryset.filter(paper__id=paper_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Application.objects.all()
        return Application.objects.filter(applicant=user)