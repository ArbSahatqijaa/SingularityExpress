from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from models.review import Review  # Adjust the import path as needed
from serializers.review_serializer import ReviewSerializer  # Adjust the import path as needed

class ReviewViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing review instances.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]  # Restrict access to authenticated users

    def get_queryset(self):
        """
        Optionally filter reviews based on query parameters.
        """
        queryset = super().get_queryset()
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        return queryset

    def list(self, request, *args, **kwargs):
        """
        Customize the list action to return only active reviews.
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Customize the create action to add additional logic.
        """
        response = super().create(request, *args, **kwargs)
        # Add custom logic here, e.g., notify the reviewer
        return response

    def retrieve(self, request, *args, **kwargs):
        """
        Customize the retrieve action to add additional logic.
        """
        response = super().retrieve(request, *args, **kwargs)
        # Add custom logic here, e.g., log access to review details
        return response

    def update(self, request, *args, **kwargs):
        """
        Customize the update action to add additional logic.
        """
        response = super().update(request, *args, **kwargs)
        # Add custom logic here, e.g., notify the reviewer of updates
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Customize the destroy action to add additional logic.
        """
        instance = self.get_object()
        # Add custom logic here, e.g., prevent deletion of certain reviews
        return super().destroy(request, *args, **kwargs)
