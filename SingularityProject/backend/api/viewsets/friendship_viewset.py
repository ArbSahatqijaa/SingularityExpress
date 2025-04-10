from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from serializers.friendship_serializer import FriendshipSerializer
from models import Friendship

class FriendshipViewSet(viewsets.ModelViewSet):

    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
    
        queryset = super().get_queryset()
        from_user = self.request.query_params.get('from_user')
        to_user = self.request.query_params.get('to_user')
        status = self.request.query_params.get('status')
        
        if from_user:
            queryset = queryset.filter(from_user__user_id=from_user)
        if to_user:
            queryset = queryset.filter(to_user__user_id=to_user)
        if status:
            queryset = queryset.filter(status=status)
    
        return queryset