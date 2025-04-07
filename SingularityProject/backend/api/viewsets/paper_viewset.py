from models.paper import Paper
from serializers.paper_serializer import PaperSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class PaperViewSet(viewsets.ModelViewSet):

    queryset = Paper.objects.all()
    serializer_class = PaperSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        "filter papers based on query parameters"

        queryset = super().get_queryset()
        visibility = self.request.query_params.get('visibility')
        status = self.request.query_params.get('status')

        if visibility:
            queryset = queryset.filter(visibility=visibility)
        if status:
            queryset = queryset.filter(status=status)

        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(status='ACTIVE')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        request.data['created_by'] = request.user.user_id
        response = super().create(request, *args, **kwargs)
        response.data['message'] = f"Paper '{response.data['title']}' created successfully!"
        return response
    
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        response.data['extra_info'] = 'This is additional information about the paper.'
        return response 

    def update(self, request, *args, **kwargs):
        if 'created_by' in request.data:
            request.data.pop('created_by')
        response = super().update(request, *args, **kwargs)
        response.data['message'] = f"Paper '{response.data['title']}' updated successfully!"
        return response
    
    def destroy(self, request, *args, **kwargs):
        instance=self.get_object()
        if instane.status == 'COMPLETED':
            return Response({'error': 'Cannot delete a completed paper.'}, status=400)
        return super().destroy(request, *args, **kwargs)