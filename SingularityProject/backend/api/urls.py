from django.urls import path
from .views.user_view import UserDetailView, UserListCreateView


urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

]
