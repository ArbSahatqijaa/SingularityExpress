from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.tutorial_serializer import TutorialSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from api.models.tutorial import Tutorial

class TutorialListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request, format=None):
        tutorials = Tutorial.objects.all()
        
        title = request.GET.get('title')

        created_by = request.GET.get('created_by')
        
        if title:
            tutorials = tutorials.filter(title__icontains=title)
        if created_by and created_by.isdigit():
            tutorials = tutorials.filter(created_by=int(created_by))    
            
        serializer = TutorialSerializer(tutorials, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = TutorialSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class TutorialDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Tutorial.objects.get(pk=pk)
        except Tutorial.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        tutorial = self.get_object(pk)
        serializer = TutorialSerializer(tutorial, context={'request': request})
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        tutorial = self.get_object(pk)
        serializer = TutorialSerializer(tutorial, data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        tutorial = self.get_object(pk)
        serializer = TutorialSerializer(tutorial, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        tutorial = self.get_object(pk)
        tutorial.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
