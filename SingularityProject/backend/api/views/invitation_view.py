from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import Http404

from api.models.invitation import Invitation
from api.serializers.invitation_serializer import InvitationSerializer


class InvitationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        invitations = Invitation.objects.all()

        sender = request.GET.get('sender')
        receiver = request.GET.get('receiver')
        project_id = request.GET.get('project_invitation')
        paper_id = request.GET.get('paper_invitation')
        status_filter = request.GET.get('status')

        if sender:
            invitations = invitations.filter(sender=sender)
        if receiver:
            invitations = invitations.filter(receiver=receiver)
        if project_id:
            invitations = invitations.filter(project_invitation=project_id)
        if paper_id:
            invitations = invitations.filter(paper_invitation=paper_id)
        if status_filter:
            invitations = invitations.filter(status__iexact=status_filter)

        serializer = InvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = InvitationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvitationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Invitation.objects.get(pk=pk)
        except Invitation.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        invitation = self.get_object(pk)
        serializer = InvitationSerializer(invitation)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        invitation = self.get_object(pk)
        serializer = InvitationSerializer(invitation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        invitation = self.get_object(pk)
        serializer = InvitationSerializer(invitation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        invitation = self.get_object(pk)
        invitation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
