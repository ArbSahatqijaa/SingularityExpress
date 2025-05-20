from requests import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework.permissions import IsAuthenticated

from api.serializers.friendship_serializer import FriendshipSerializer
from api.models.friendship import Friendship

from django.db.models import Q 

class FriendshipListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        friendships = Friendship.objects.all()

        from_user = request.GET.get('from_user')
        to_user = request.GET.get('to_user')
        status_filter = request.GET.get('status')

        if from_user:
            friendships = friendships.filter(from_user=from_user)
        if to_user:
            friendships = friendships.filter(to_user=to_user)
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
    permission_classes = [IsAuthenticated]

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
    
    def post(self, request, format=None):
        existing = Friendship.objects.filter(
            from_user=request.user,
            to_user=request.data.get('to_user')
        ).exists()
        
        if existing:
            return Response(
                {'error': 'Friend request already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # You may want to add logic here for creating a new friendship if it doesn't exist
        serializer = FriendshipSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(from_user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        friendship = self.get_object(pk)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# The above code defines the API views for managing friendships in a Django application.
class FriendshipStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id, format=None):
        friendship = Friendship.objects.filter(
            Q(from_user=request.user, to_user=user_id) |
            Q(from_user=user_id, to_user=request.user)).first()

        if not friendship:
            return Response({'status': 'NONE'}, status=status.HTTP_200_OK)
            
        serializer = FriendshipSerializer(friendship)
        return Response({'status': serializer.data['status']})