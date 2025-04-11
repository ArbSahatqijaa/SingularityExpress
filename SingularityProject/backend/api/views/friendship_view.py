from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.friendship_serializer import FriendshipSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.friendship import Friendship

class FriendshipListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        friendships = Friendship.objects.all()
        
        user1 = request.GET.get('user1')
        user2 = request.GET.get('user2')
        status_filter = request.GET.get('status')
        
        if user1:
            friendships = friendships.filter(user1=user1)
        if user2:
            friendships = friendships.filter(user2=user2)
        if status_filter:
            friendships = friendships.filter(status__iexact=status_filter)
            
        serializer = FriendshipSerializer(friendships, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = FriendshipSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class FriendshipDetailView(APIView):
    
    def get_object(self, pk):
        try:
            return Friendship.objects.get(pk=pk)
        except Friendship.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        friendship = self.get_object(pk)
        serializer = FriendshipSerializer(friendship)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        friendship = self.get_object(pk)
        serializer = FriendshipSerializer(friendship, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        friendship = self.get_object(pk)
        serializer = FriendshipSerializer(friendship, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        friendship = self.get_object(pk)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
