from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models import UserPaper
from serializers.user_paper_serializer import UserPaperSerializer

class UserPaperViewSet(viewsets.ModelViewSet):
    queryset = UserPaper.objects.all()
    serializer_class = UserPaperSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        "you can filter the user-project relationship based on the query paramameters"
        "query parameters that are supported are: user_id-to filter papers by a specific user, paper_id-to filter users by a specific paper"
        
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        paper_id = self.request.query_params.get('paper_id')

        if user_id:
            queryset = queryset.filter(user__user_id=user_id)
        if paper_id:
            queryset = queryset.filter(paper__paper_id=paper_id)

        return queryset