from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.paper_serializer import PaperSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.paper import Paper

class PaperListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        papers = Paper.objects.all()
        
        title = request.GET.get('title')
        visibility = request.GET.get('visibility')
        status_filter = request.GET.get('status')
        
        if title:
            papers = papers.filter(title__icontains=title)
        if visibility:
            papers = papers.filter(visibility__iexact=visibility)
        if status_filter:
            papers = papers.filter(status__iexact=status_filter)
            
        serializer = PaperSerializer(papers, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = PaperSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(created_by=request.user)  # Set the creator explicitly
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
class PaperDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        try:
            return Paper.objects.get(pk=pk)
        except Paper.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        paper = self.get_object(pk)
        serializer = PaperSerializer(paper)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        paper = self.get_object(pk)
        serializer = PaperSerializer(paper, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        paper = self.get_object(pk)
        serializer = PaperSerializer(paper, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        paper = self.get_object(pk)
        paper.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
