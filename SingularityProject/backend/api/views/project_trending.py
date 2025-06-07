from rest_framework.views       import APIView
from rest_framework.response    import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models           import Count
from api.models.project         import Project
from api.serializers.project_serializer import ProjectSerializer

class ProjectTrendingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        qs = (
            Project.objects
                   .annotate(worker_count=Count('project_users'))
                   .order_by('-worker_count', '-updated_at')[:7]
        )
        serializer = ProjectSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)