from requests import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from api.serializers.friendship_serializer import FriendshipSerializer
from api.models.friendship import Friendship

class FriendshipListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            # Only get friendships where the current user is either the sender or receiver
            friendships = Friendship.objects.filter(
                Q(from_user=request.user) | Q(to_user=request.user)
            ).select_related('from_user', 'to_user')

            from_user = request.GET.get('from_user')
            to_user = request.GET.get('to_user')
            status_filter = request.GET.get('status')

            if from_user:
                friendships = friendships.filter(from_user=from_user)
            if to_user:
                friendships = friendships.filter(to_user=to_user)
            if status_filter:
                friendships = friendships.filter(status__iexact=status_filter)

            serializer = FriendshipSerializer(friendships, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, format=None):
        try:
            # Check if the friendship already exists
            existing = Friendship.objects.filter(
                Q(from_user=request.user, to_user=request.data.get('to_user')) |
                Q(from_user=request.data.get('to_user'), to_user=request.user)
            ).exists()
            
            if existing:
                return Response(
                    {'error': 'Friend request already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            serializer = FriendshipSerializer(data=request.data, context={'request': request})

            if serializer.is_valid():
                # Set initial status to PENDING
                friendship = serializer.save(status='PENDING')
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FriendshipDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Friendship.objects.get(pk=pk)
        except Friendship.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        friendship = self.get_object(pk)
        serializer = FriendshipSerializer(friendship, context={'request': request})
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

# The above code defines the API views for managing friendships in a Django application.
class FriendshipStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id, format=None):
        friendship = Friendship.objects.filter(
            Q(from_user=request.user, to_user=user_id) |
            Q(from_user=user_id, to_user=request.user)).first()

        if not friendship:
            return Response({'status': 'NONE'}, status=status.HTTP_200_OK)
            
        serializer = FriendshipSerializer(friendship, context={'request': request})
        friendship_data = serializer.data
        
        return Response({
            'status': friendship_data['status'],
            'id': friendship_data['id'],
            'from_user': friendship_data['from_user'],
            'to_user': friendship_data['to_user'],
            'created_at': friendship_data['created_at']
        })

class PendingFriendRequestsView(APIView):
    """
    Get count of pending friend requests for the current user
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Count friendship requests sent to the current user with PENDING status
        pending_count = Friendship.objects.filter(
            to_user=request.user,
            status='PENDING'
        ).count()

        # Get the pending friend requests with user details
        pending_requests = Friendship.objects.filter(
            to_user=request.user,
            status='PENDING'
        ).select_related('from_user')

        # Serialize the requests
        serializer = FriendshipSerializer(pending_requests, many=True, context={'request': request})

        return Response({
            'count': pending_count,
            'requests': serializer.data
        })