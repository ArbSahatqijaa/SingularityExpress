from rest_framework import generics, permissions
from api.models.application import Application
from api.serializers.application_serializer import ApplicationSerializer
from rest_framework.response import Response
from rest_framework import status

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.all() # if user.is_staff else Application.objects.filter(applicant=user)

        project_id = self.request.query_params.get('project_id')
        paper_id = self.request.query_params.get('paper_id')

        # Ensure IDs are integers if passed
        if project_id:
            try:
                project_id = int(project_id)
                queryset = queryset.filter(project_id=project_id)
            except ValueError:
                raise ValidationError("Invalid project_id: must be an integer")

        if paper_id:
            try:
                paper_id = int(paper_id)
                queryset = queryset.filter(paper_id=paper_id)
            except ValueError:
                raise ValidationError("Invalid paper_id: must be an integer")

        return queryset

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.all()
        return Application.objects.all()
    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            print(serializer.errors)  # Add this line to debug errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)