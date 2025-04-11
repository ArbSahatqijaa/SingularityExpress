from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from api.serializers.user_serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model
User = get_user_model()

#qikjo klas o per list te userave
class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):

        users = User.objects.all()   #query all User instances
        
        role = request.GET.get('role')
        academic_title = request.GET.get('academic_title')
        profession = request.GET.get('profession')
        
        #if we decide to get the list of users by a single attribute, like the ones below
        if role:
            users = users.filter(role__iexact=role) #iexact i thet pythonit qe sja nin per upper ose lower case
        if academic_title:
            users = users.filter(academic_title__iexact=academic_title)
        if profession:
            users = users.filter(profession__iexact=profession)
        

        serializer = UserSerializer(users, many=True)   #use the serializer to convert user instances to JSON

        return Response(serializer.data)
    
    def post(self, request, format=None):

        serializer = UserSerializer(data=request.data) #create a serializer instance with the provided data

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    #kjo tjetra tash o per single user
class UserDetailView(APIView):

    def get_object(self, pk):

        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404
            
        #full update of one user
    def put(self, request, pk, format=None):

        user = self.get_object(pk)

        serializer = UserSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        #partial update of one user
    def patch(self, request, pk, format=None):
            
        user = self.get_object(pk) 
            
        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk, format=None):
        user = self.get_object(pk)

        user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)