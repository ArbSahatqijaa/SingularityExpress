from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.paper_serializer import PaperSerializer
from rest_framework.permissions import IsAuthenticated
from api.models.user_paper import UserPaper
from api.models.paper import Paper
from rest_framework.parsers import MultiPartParser, FormParser


class PaperListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]
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

        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        paper = serializer.save(created_by = request.user)

        return Response (
            PaperSerializer(paper).data,
            status=status.HTTP_201_CREATED
        )
        
        
        
class PaperDetailView(APIView):
    parser_classes = [FormParser, MultiPartParser]
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

        if not (
            request.user == paper.created_by 
            or request.user.is_staff 
            or request.user.is_superuser
        ):
            return Response(
                {'detail': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PaperSerializer(paper, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
    def patch(self, request, pk, format=None):
        paper = self.get_object(pk)

        if not (request.user == paper.created_by
                or request.user.is_staff
                or request.user.is_superuser):
            return Response(
                {'detail': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )


        serializer = PaperSerializer(paper, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        paper = self.get_object(pk)

        if not (
            request.user == paper.created_by
            or request.user.is_staff
            or request.user.is_superuser
        ):
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )


        paper.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)