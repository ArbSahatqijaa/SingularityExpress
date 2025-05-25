from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views.auth import WhoAmI
from .views.user_view import UserDetailView, UserListCreateView
from .views.friendship_view import FriendshipListCreateView, FriendshipDetailView, FriendshipStatusView, PendingFriendRequestsView
from .views.user_project_view import UserProjectDetailView, UserProjectListCreateView
from .views.user_paper_view import UserPaperListCreateView, UserPaperDetailView
from .views.tutorial_view import TutorialListCreateView, TutorialDetailView
from .views.review_view import ReviewListCreateView, ReviewDetailView
#from .views.required_roles_view import RequiredRolesListCreateView, RequiredRolesDetailView, RoleChoicesView, AllowedContentTypesView
from .views.project_view import ProjectListCreateView, ProjectDetailView
from .views.paper_view import PaperListCreateView, PaperDetailView
from .views.paper_project_view import PaperProjectListCreateView, PaperProjectDetailView
from .views.invitation_view import InvitationListCreateView, InvitationDetailView
from .views.message_view import create_message, update_message, delete_message, get_messages, upload_chat_file, download_chat_file
from .views.chat_with_api import chat_with_api, test_mongodb_connection
from .views.application_view import ApplicationListCreateView, ApplicationDetailView
from . import views
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [

    #JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #fetches the logged-in user
    path('whoami/', WhoAmI.as_view(), name='whoami'),

    # User URLs
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    # Friendship URLs
    path('friendships/', FriendshipListCreateView.as_view(), name='friendship-list-create'),
    path('friendships/status/<int:user_id>/', FriendshipStatusView.as_view(), name='friendship-status'),
    path('friendships/<int:pk>/', FriendshipDetailView.as_view(), name='friendship-detail'),
    path('friendships/pending/', PendingFriendRequestsView.as_view(), name='pending-friend-requests'),

    # User Project URLs
    path('user_projects/', UserProjectListCreateView.as_view(), name='user-project-list-create'),
    path('user_projects/<int:pk>/', UserProjectDetailView.as_view(), name='user-project-detail'),

    # User Paper URLs
    path('user_papers/', UserPaperListCreateView.as_view(), name='user-paper-list-create'),
    path('user_papers/<int:pk>/', UserPaperDetailView.as_view(), name='user-paper-detail'),

    # Tutorial URLs
    path('tutorials/', TutorialListCreateView.as_view(), name='tutorial-list-create'),
    path('tutorials/<int:pk>/', TutorialDetailView.as_view(), name='tutorial-detail'),

    # Review URLs
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),

    # Required Roles URLs
    #path('required_roles/', RequiredRolesListCreateView.as_view(), name='required-roles-list-create'),
    #path('required_roles/<int:pk>/', RequiredRolesDetailView.as_view(), name='required-roles-detail'),
    #path('role_choices/', RoleChoicesView.as_view(), name='role-choices'),
    #path('allowed_content_types/', AllowedContentTypesView.as_view(), name='allowed-content-types'), 

    # Project URLs
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

    # Paper URLs
    path('papers/', PaperListCreateView.as_view(), name='paper-list-create'),
    path('papers/<int:pk>/', PaperDetailView.as_view(), name='paper-detail'),

    # Paper Project URLs
    path('paper_projects/', PaperProjectListCreateView.as_view(), name='paper-project-list-create'),
    path('paper_projects/<int:pk>/', PaperProjectDetailView.as_view(), name='paper-project-detail'),

    # Invitation URLs
    path('invitations/', InvitationListCreateView.as_view(), name='invitation-list-create'),
    path('invitations/<int:pk>/', InvitationDetailView.as_view(), name='invitation-detail'),

    path('create_message/', views.create_message, name='create_message'),
    path('get_messages/<str:conversation_id>/', views.get_messages, name='get_messages'),
    path('update_message/<str:message_id>/', views.update_message, name='update_message'),
    path('delete_message/<str:message_id>/', views.delete_message, name='delete_message'),
    path('chat/upload_file/', upload_chat_file, name='upload_chat_file'),
    path('chat/download/<str:filename>/', download_chat_file, name='download_chat_file'),
    path('chat/', chat_with_api, name='chat_with_api'),
    path('chat/test-mongodb/', test_mongodb_connection, name='test_mongodb'),

    #Application urls
    path('applications/', ApplicationListCreateView.as_view(), name='application-list-create'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
