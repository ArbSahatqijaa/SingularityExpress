from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from api.serializers.user_serializer import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Overrides DRF's SessionAuthentication to skip CSRF checks.
    """
    def enforce_csrf(self, request):
        return  # no-op: skip CSRF


class UserListCreateView(APIView):
    authentication_classes = (
        CsrfExemptSessionAuthentication,
        JWTAuthentication,
    )

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, format=None):
        users = User.objects.all()  # Query all User instances
        
        role = request.GET.get('role')
        academic_title = request.GET.get('academic_title')
        profession = request.GET.get('profession')

        if role:
            users = users.filter(role__iexact=role)
        if academic_title:
            users = users.filter(academic_title__iexact=academic_title)
        if profession:
            users = users.filter(profession__iexact=profession)

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        # Create a serializer instance with the provided data (multipart form-data for file uploads)
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the user with images
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If the data is invalid, return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        user = self.get_object(pk)
        data = request.data

        # If password is provided, hash it
        if 'password' in data:
            data['password'] = make_password(data['password'])

        serializer = UserSerializer(user, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        user = self.get_object(pk)
        data = request.data

        if 'password' in data:
            data['password'] = make_password(data['password'])

        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
