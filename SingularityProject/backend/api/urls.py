from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets.user_viewset import UserViewSet  # Import the UserViewSet

# Create a router and register the UserViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

# Combine router URLs with other views
urlpatterns = [
    path('', include(router.urls)),  # Include all routes generated by the router
    # path('example/', ExampleView.as_view(), name='example-list'),  #Ky line per at example view qe e kemi perdor per item1,2

]
