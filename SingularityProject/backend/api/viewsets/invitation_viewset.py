from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from serializers.invitation_serializer import InvitationSerializer
from models import Invitation


"""Skeni nevoj me shtu metoda tjera, perveq nese na duhet mavon.ModelViewSet i kish CRUD methods build in"""

class InvitationViewSet(viewsets.ModelViewSet):

    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = super().get_queryset()
        sender = self.request.query_params.get('sender')
        receiver = self.request.query_params.get('receiver')
        project_invitation = self.request.query_params.get('project_invitation')
        paper_invitation = self.request.query_params.get('paper_invitation')
        status = self.request.query_params.get('status')

        if sender:
            queryset = queryset.filter(sender__user_id=sender)
        if receiver:
            queryset = queryset.filter(receiver__user_id=receiver)
        if project_invitation:
            queryset = queryset.filter(project_invitation__project_id=project_invitation)
        if paper_invitation:
            queryset = queryset.filter(paper_invitation__paper_id=paper_invitation)
        if status:
            queryset = queryset.filter(status=status)

        return queryset

