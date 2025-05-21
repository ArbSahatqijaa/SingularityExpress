from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.serializers.user_serializer import UserSerializer
from api.models.friendship import Friendship

class WhoAmI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data

        pending_count = Friendship.objects.filter(
            to_user=user,
            status='PENDING'
        ).count()
        user_data['pending_friend_requests'] = pending_count

        return Response(user_data)