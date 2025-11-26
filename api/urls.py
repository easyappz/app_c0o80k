from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    UserListView,
    UserDetailView,
    UserUpdateView,
    PostListView,
    PostCreateView,
    PostDetailView,
    PostDeleteView,
    UserPostsView,
    CommentListView,
    CommentCreateView,
    CommentDeleteView,
    LikeToggleView,
    FriendsListView,
    FriendRequestsView,
    SentRequestsView,
    SendFriendRequestView,
    AcceptFriendRequestView,
    RejectFriendRequestView,
    RemoveFriendView,
    ConversationsListView,
    ConversationMessagesView,
    SendMessageView,
)

urlpatterns = [
    # Auth endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),

    # Users endpoints
    path("users/", UserListView.as_view(), name="users-list"),
    path("users/<int:id>/", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:id>/", UserUpdateView.as_view(), name="user-update"),

    # Posts endpoints
    path("posts/", PostListView.as_view(), name="posts-list"),
    path("posts/", PostCreateView.as_view(), name="post-create"),
    path("posts/<int:id>/", PostDetailView.as_view(), name="post-detail"),
    path("posts/<int:id>/", PostDeleteView.as_view(), name="post-delete"),
    path("users/<int:user_id>/posts/", UserPostsView.as_view(), name="user-posts"),

    # Comments endpoints
    path("posts/<int:post_id>/comments/", CommentListView.as_view(), name="comments-list"),
    path("posts/<int:post_id>/comments/", CommentCreateView.as_view(), name="comment-create"),
    path("comments/<int:id>/", CommentDeleteView.as_view(), name="comment-delete"),

    # Likes endpoints
    path("posts/<int:post_id>/like/", LikeToggleView.as_view(), name="like-toggle"),

    # Friends endpoints
    path("friends/", FriendsListView.as_view(), name="friends-list"),
    path("friends/requests/", FriendRequestsView.as_view(), name="friend-requests"),
    path("friends/sent/", SentRequestsView.as_view(), name="friend-sent"),
    path("friends/request/<int:user_id>/", SendFriendRequestView.as_view(), name="send-friend-request"),
    path("friends/accept/<int:request_id>/", AcceptFriendRequestView.as_view(), name="accept-friend-request"),
    path("friends/reject/<int:request_id>/", RejectFriendRequestView.as_view(), name="reject-friend-request"),
    path("friends/<int:user_id>/", RemoveFriendView.as_view(), name="remove-friend"),

    # Messages endpoints
    path("conversations/", ConversationsListView.as_view(), name="conversations-list"),
    path("conversations/<int:user_id>/", ConversationMessagesView.as_view(), name="conversation-messages"),
    path("messages/", SendMessageView.as_view(), name="send-message"),
]
