from rest_framework.views      import APIView
from rest_framework.response   import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models          import Count
from api.models.paper          import Paper
from api.serializers.paper_serializer import PaperSerializer

class PaperTrendingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        qs = (
            Paper.objects
                 .annotate(worker_count=Count('paper_users'))
                 .order_by('-worker_count', '-updated_at')[:7]
        )
        serializer = PaperSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)
