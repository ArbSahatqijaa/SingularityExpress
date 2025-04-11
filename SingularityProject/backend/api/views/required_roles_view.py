from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.required_roles_serializer import RequiredRolesSerializer
from rest_framework.permissions import IsAuthenticated

from api.models.required_roles import RequiredRoles

class RequiredRolesListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        required_roles = RequiredRoles.objects.all()
        
        project = request.GET.get('project')
        role = request.GET.get('role')
        
        if project:
            required_roles = required_roles.filter(project=project)
        if role:
            required_roles = required_roles.filter(role__iexact=role)
            
        serializer = RequiredRolesSerializer(required_roles, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = RequiredRolesSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class RequiredRolesDetailView(APIView):
    
    def get_object(self, pk):
        try:
            return RequiredRoles.objects.get(pk=pk)
        except RequiredRoles.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, format=None):
        required_role = self.get_object(pk)
        serializer = RequiredRolesSerializer(required_role)
        return Response(serializer.data)
            
    def put(self, request, pk, format=None):
        required_role = self.get_object(pk)
        serializer = RequiredRolesSerializer(required_role, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk, format=None):
        required_role = self.get_object(pk)
        serializer = RequiredRolesSerializer(required_role, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        required_role = self.get_object(pk)
        required_role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
