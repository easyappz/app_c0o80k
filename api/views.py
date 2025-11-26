from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count, Exists, OuterRef, Max
from django.shortcuts import get_object_or_404
from api.models import Member, Post, Comment, Like, FriendRequest, Friendship, Message
from api.serializers import (
    MemberSerializer,
    RegisterSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    FriendRequestSerializer,
    FriendshipSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    ConversationSerializer,
    MemberShortSerializer,
)
import uuid


class CookieAuthentication(BaseAuthentication):
    """
    Custom authentication class that reads member_id from HttpOnly cookie 'session_id'
    """

    def authenticate(self, request):
        session_id = request.COOKIES.get('session_id')
        if not session_id:
            return None

        try:
            member_id = int(session_id)
            member = Member.objects.get(id=member_id)
            return (member, None)
        except (ValueError, Member.DoesNotExist):
            raise AuthenticationFailed('Invalid session')


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Register a new user
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            response_data = MemberSerializer(member).data
            response = Response(response_data, status=status.HTTP_201_CREATED)
            response.set_cookie(
                key='session_id',
                value=str(member.id),
                httponly=True,
                samesite='Lax',
                max_age=30 * 24 * 60 * 60  # 30 days
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Login user
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            try:
                member = Member.objects.get(username=username)
                if member.check_password(password):
                    response_data = MemberSerializer(member).data
                    response = Response(response_data, status=status.HTTP_200_OK)
                    response.set_cookie(
                        key='session_id',
                        value=str(member.id),
                        httponly=True,
                        samesite='Lax',
                        max_age=30 * 24 * 60 * 60  # 30 days
                    )
                    return response
                else:
                    return Response(
                        {"error": "Invalid credentials"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Member.DoesNotExist:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout user
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('session_id')
        return response


class MeView(APIView):
    """
    GET /api/auth/me/
    Get current user
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(APIView):
    """
    GET /api/users/
    Get list of users with optional search
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        users = Member.objects.all()

        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        serializer = MemberSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    """
    GET /api/users/{id}/
    Get user profile by ID
    
    PUT /api/users/{id}/
    Update user profile (only own profile)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        user = get_object_or_404(Member, id=id)
        serializer = MemberSerializer(user)
        data = serializer.data

        # Check friendship status
        current_user = request.user
        is_friend = Friendship.objects.filter(
            Q(user1=current_user, user2=user) | Q(user1=user, user2=current_user)
        ).exists()
        data['is_friend'] = is_friend

        # Check friend request status
        friend_request_status = None
        sent_request = FriendRequest.objects.filter(
            from_user=current_user, to_user=user, status='pending'
        ).first()
        if sent_request:
            friend_request_status = 'pending_sent'
        else:
            received_request = FriendRequest.objects.filter(
                from_user=user, to_user=current_user, status='pending'
            ).first()
            if received_request:
                friend_request_status = 'pending_received'

        data['friend_request_status'] = friend_request_status

        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, id):
        user = get_object_or_404(Member, id=id)

        if user.id != request.user.id:
            return Response(
                {"error": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(MemberSerializer(user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostListView(APIView):
    """
    GET /api/posts/
    Get news feed (posts from friends and own posts)
    
    POST /api/posts/
    Create a new post
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_user = request.user

        # Get list of friends
        friends_as_user1 = Friendship.objects.filter(user1=current_user).values_list('user2_id', flat=True)
        friends_as_user2 = Friendship.objects.filter(user2=current_user).values_list('user1_id', flat=True)
        friend_ids = list(friends_as_user1) + list(friends_as_user2)

        # Get posts from friends and self
        posts = Post.objects.filter(
            Q(author_id__in=friend_ids) | Q(author=current_user)
        ).order_by('-created_at')

        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PostCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save()
            return Response(
                PostSerializer(post, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(APIView):
    """
    GET /api/posts/{id}/
    Get post by ID
    
    DELETE /api/posts/{id}/
    Delete own post
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        post = get_object_or_404(Post, id=id)
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        post = get_object_or_404(Post, id=id)

        if post.author.id != request.user.id:
            return Response(
                {"error": "You can only delete your own posts"},
                status=status.HTTP_403_FORBIDDEN
            )

        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserPostsView(APIView):
    """
    GET /api/users/{user_id}/posts/
    Get all posts by specific user
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(Member, id=user_id)
        posts = Post.objects.filter(author=user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommentListView(APIView):
    """
    GET /api/posts/{post_id}/comments/
    Get all comments for a post
    
    POST /api/posts/{post_id}/comments/
    Add a comment to a post
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        comments = Comment.objects.filter(post=post).order_by('created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = CommentCreateSerializer(data=request.data, context={'request': request, 'post_id': post_id})
        if serializer.is_valid():
            comment = Comment.objects.create(
                post=post,
                author=request.user,
                content=serializer.validated_data['content']
            )
            return Response(
                CommentSerializer(comment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDeleteView(APIView):
    """
    DELETE /api/comments/{id}/
    Delete own comment
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        comment = get_object_or_404(Comment, id=id)

        if comment.author.id != request.user.id:
            return Response(
                {"error": "You can only delete your own comments"},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LikeToggleView(APIView):
    """
    POST /api/posts/{post_id}/like/
    Toggle like on a post
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like = Like.objects.filter(post=post, user=request.user).first()

        if like:
            like.delete()
            is_liked = False
        else:
            Like.objects.create(post=post, user=request.user)
            is_liked = True

        likes_count = Like.objects.filter(post=post).count()

        return Response(
            {"is_liked": is_liked, "likes_count": likes_count},
            status=status.HTTP_200_OK
        )


class FriendsListView(APIView):
    """
    GET /api/friends/
    Get list of current user's friends
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_user = request.user
        friendships = Friendship.objects.filter(
            Q(user1=current_user) | Q(user2=current_user)
        )
        serializer = FriendshipSerializer(friendships, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class FriendRequestsView(APIView):
    """
    GET /api/friends/requests/
    Get incoming friend requests
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = FriendRequest.objects.filter(
            to_user=request.user,
            status='pending'
        ).order_by('-created_at')
        serializer = FriendRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SentRequestsView(APIView):
    """
    GET /api/friends/sent/
    Get sent friend requests
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = FriendRequest.objects.filter(
            from_user=request.user,
            status='pending'
        ).order_by('-created_at')
        serializer = FriendRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SendFriendRequestView(APIView):
    """
    POST /api/friends/request/{user_id}/
    Send a friend request
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        to_user = get_object_or_404(Member, id=user_id)
        current_user = request.user

        if to_user.id == current_user.id:
            return Response(
                {"error": "Cannot send friend request to yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already friends
        if Friendship.objects.filter(
            Q(user1=current_user, user2=to_user) | Q(user1=to_user, user2=current_user)
        ).exists():
            return Response(
                {"error": "Already friends"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if request already exists
        if FriendRequest.objects.filter(
            Q(from_user=current_user, to_user=to_user) | Q(from_user=to_user, to_user=current_user),
            status='pending'
        ).exists():
            return Response(
                {"error": "Friend request already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request = FriendRequest.objects.create(
            from_user=current_user,
            to_user=to_user,
            status='pending'
        )
        serializer = FriendRequestSerializer(friend_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AcceptFriendRequestView(APIView):
    """
    POST /api/friends/accept/{request_id}/
    Accept a friend request
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        friend_request = get_object_or_404(FriendRequest, id=request_id)

        if friend_request.to_user.id != request.user.id:
            return Response(
                {"error": "You can only accept requests sent to you"},
                status=status.HTTP_403_FORBIDDEN
            )

        if friend_request.status != 'pending':
            return Response(
                {"error": "Request is not pending"},
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request.status = 'accepted'
        friend_request.save()

        # Create friendship
        Friendship.objects.create(
            user1=friend_request.from_user,
            user2=friend_request.to_user
        )

        serializer = FriendRequestSerializer(friend_request)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RejectFriendRequestView(APIView):
    """
    POST /api/friends/reject/{request_id}/
    Reject a friend request
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        friend_request = get_object_or_404(FriendRequest, id=request_id)

        if friend_request.to_user.id != request.user.id:
            return Response(
                {"error": "You can only reject requests sent to you"},
                status=status.HTTP_403_FORBIDDEN
            )

        if friend_request.status != 'pending':
            return Response(
                {"error": "Request is not pending"},
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request.status = 'rejected'
        friend_request.save()

        serializer = FriendRequestSerializer(friend_request)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RemoveFriendView(APIView):
    """
    DELETE /api/friends/{user_id}/
    Remove a friend
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        friend = get_object_or_404(Member, id=user_id)
        current_user = request.user

        friendship = Friendship.objects.filter(
            Q(user1=current_user, user2=friend) | Q(user1=friend, user2=current_user)
        ).first()

        if not friendship:
            return Response(
                {"error": "Friendship not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConversationsListView(APIView):
    """
    GET /api/conversations/
    Get list of all conversations
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_user = request.user

        # Get all users with whom current user has messages
        sent_to = Message.objects.filter(sender=current_user).values_list('recipient_id', flat=True).distinct()
        received_from = Message.objects.filter(recipient=current_user).values_list('sender_id', flat=True).distinct()
        conversation_user_ids = set(list(sent_to) + list(received_from))

        conversations = []
        for user_id in conversation_user_ids:
            user = Member.objects.get(id=user_id)

            # Get last message
            last_message = Message.objects.filter(
                Q(sender=current_user, recipient=user) | Q(sender=user, recipient=current_user)
            ).order_by('-created_at').first()

            # Count unread messages
            unread_count = Message.objects.filter(
                sender=user,
                recipient=current_user,
                is_read=False
            ).count()

            conversations.append({
                'user': user,
                'last_message': last_message,
                'unread_count': unread_count
            })

        # Sort by last message time
        conversations.sort(key=lambda x: x['last_message'].created_at if x['last_message'] else None, reverse=True)

        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConversationMessagesView(APIView):
    """
    GET /api/conversations/{user_id}/
    Get all messages in conversation with a specific user
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(Member, id=user_id)
        current_user = request.user

        messages = Message.objects.filter(
            Q(sender=current_user, recipient=user) | Q(sender=user, recipient=current_user)
        ).order_by('created_at')

        # Mark messages as read
        Message.objects.filter(
            sender=user,
            recipient=current_user,
            is_read=False
        ).update(is_read=True)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SendMessageView(APIView):
    """
    POST /api/messages/
    Send a message
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MessageCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            message = serializer.save()
            return Response(
                MessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
