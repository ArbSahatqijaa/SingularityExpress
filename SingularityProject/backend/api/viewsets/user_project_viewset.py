from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models import UserProject
from serializers.user_project_serialzier import UserProjectSerializer

class UserProjectViewSet(viewsets.ModelViewSet):

    queryset = UserProject.objects.all()
    serializer_class = UserProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        "you can filter the user-project relationship based on the query paramameters"
        "query parameters that are supported are: user_id-to filter projects by a specific user, project_id-to filter users by a specific project"

        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        project_id = self.request.query_params.get('project_id')

        if user_id:
            queryset = queryset.filter(user__user_id=user_id)

        if project_id:
            queryset = queryset.filter(project__project_id=project_id)

        return queryset       
   
        







