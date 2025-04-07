from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models.tutorial import Tutorial  # Adjust the import path if needed
from serializers.tutorial_serializer import TutorialSerializer  # Adjust the import path if needed

class TutorialViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Tutorial instances.
    """
    queryset = Tutorial.objects.all()
    serializer_class = TutorialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter tutorials by title or created_by (user id).
        """
        queryset = super().get_queryset()
        title = self.request.query_params.get('title')
        created_by = self.request.query_params.get('created_by')

        if title:
            queryset = queryset.filter(title__icontains=title)
        if created_by:
            queryset = queryset.filter(created_by__id=created_by)

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Customize the list action.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Automatically associate created_by with the logged-in user.
        """
        request.data._mutable = True  # in case of immutability in request.data
        request.data['created_by'] = request.user.user_id
        request.data._mutable = False
        response = super().create(request, *args, **kwargs)
        # Optionally: log, send notification, etc.
        return response

    def retrieve(self, request, *args, **kwargs):
        """
        Customize the retrieve action.
        """
        response = super().retrieve(request, *args, **kwargs)
        # Optionally: log access
        return response

    def update(self, request, *args, **kwargs):
        """
        Customize the update action.
        """
        response = super().update(request, *args, **kwargs)
        # Optionally: notify creator or log change
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Customize the destroy action.
        """
        instance = self.get_object()
        # Optionally: prevent delete if user is not creator
        return super().destroy(request, *args, **kwargs)
