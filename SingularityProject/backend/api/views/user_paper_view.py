from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.user_paper_serializer import UserPaperSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from api.models.user_paper import UserPaper

class UserPaperListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        user_papers = UserPaper.objects.all()
        
        user = request.GET.get('user')
        paper = request.GET.get('paper')
        role = request.GET.get('role')
        
        if user:
            user_papers = user_papers.filter(user=user)
        if paper:
            user_papers = user_papers.filter(paper=paper)
        if role:
            user_papers = user_papers.filter(role__iexact=role)
            
        serializer = UserPaperSerializer(user_papers, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        # This line is now properly indented
        serializer = UserPaperSerializer(data=request.data)

        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response({'detail': 'This user is already assigned to the paper.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class UserPaperDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return UserPaper.objects.get(pk=pk)
        except UserPaper.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        user_paper = self.get_object(pk)
        serializer = UserPaperSerializer(user_paper)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        user_paper = self.get_object(pk)
        serializer = UserPaperSerializer(user_paper, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        user_paper = self.get_object(pk)
        serializer = UserPaperSerializer(user_paper, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        user_paper = self.get_object(pk)
        user_paper.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
