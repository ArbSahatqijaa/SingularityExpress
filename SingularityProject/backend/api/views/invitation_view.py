from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.invitation_serializer import InvitationSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.invitation import Invitation

class InvitationListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        invitations = Invitation.objects.all()
        
        project = request.GET.get('project')
        user = request.GET.get('user')
        status_filter = request.GET.get('status')
        
        if project:
            invitations = invitations.filter(project=project)
        if user:
            invitations = invitations.filter(user=user)
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
