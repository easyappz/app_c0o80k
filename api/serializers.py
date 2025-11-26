from rest_framework import serializers
from api.models import Member, Post, Comment, Like, FriendRequest, Friendship, Message
from django.db.models import Q


class MemberShortSerializer(serializers.ModelSerializer):
    """Short user info for nested representation"""
    class Meta:
        model = Member
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar_url']
        read_only_fields = ['id', 'username', 'first_name', 'last_name', 'avatar_url']


class MemberSerializer(serializers.ModelSerializer):
    """Full user profile serializer"""
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'username', 'email', 'created_at']


class RegisterSerializer(serializers.Serializer):
    """User registration serializer"""
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True)
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    """User login serializer"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Update user profile serializer"""
    class Meta:
        model = Member
        fields = ['first_name', 'last_name', 'bio', 'avatar_url']


class PostSerializer(serializers.ModelSerializer):
    """Post serializer with nested author and counts"""
    author = MemberShortSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'likes_count', 'comments_count', 'is_liked', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user:
            return Like.objects.filter(post=obj, user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Create post serializer"""
    class Meta:
        model = Post
        fields = ['content']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    """Comment serializer with nested author"""
    author = MemberShortSerializer(read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post_id', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'post_id', 'author', 'created_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Create comment serializer"""
    class Meta:
        model = Comment
        fields = ['content']

    def create(self, validated_data):
        request = self.context.get('request')
        post_id = self.context.get('post_id')
        validated_data['author'] = request.user
        validated_data['post_id'] = post_id
        return super().create(validated_data)


class FriendRequestSerializer(serializers.ModelSerializer):
    """Friend request serializer with nested users"""
    from_user = MemberShortSerializer(read_only=True)
    to_user = MemberShortSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
        read_only_fields = ['id', 'from_user', 'to_user', 'status', 'created_at']


class FriendshipSerializer(serializers.ModelSerializer):
    """Friendship serializer - returns friend info"""
    id = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'avatar_url', 'created_at']

    def get_friend(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if obj.user1 == request.user:
                return obj.user2
            else:
                return obj.user1
        return None

    def get_id(self, obj):
        friend = self.get_friend(obj)
        return friend.id if friend else None

    def get_username(self, obj):
        friend = self.get_friend(obj)
        return friend.username if friend else None

    def get_email(self, obj):
        friend = self.get_friend(obj)
        return friend.email if friend else None

    def get_first_name(self, obj):
        friend = self.get_friend(obj)
        return friend.first_name if friend else None

    def get_last_name(self, obj):
        friend = self.get_friend(obj)
        return friend.last_name if friend else None

    def get_bio(self, obj):
        friend = self.get_friend(obj)
        return friend.bio if friend else None

    def get_avatar_url(self, obj):
        friend = self.get_friend(obj)
        return friend.avatar_url if friend else None

    def get_created_at(self, obj):
        friend = self.get_friend(obj)
        return friend.created_at if friend else None


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer with nested sender and recipient"""
    sender = MemberShortSerializer(read_only=True)
    recipient = MemberShortSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'recipient', 'is_read', 'created_at']


class MessageCreateSerializer(serializers.Serializer):
    """Create message serializer"""
    recipient_id = serializers.IntegerField(required=True)
    content = serializers.CharField(required=True)

    def validate_recipient_id(self, value):
        if not Member.objects.filter(id=value).exists():
            raise serializers.ValidationError("Recipient not found")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        recipient = Member.objects.get(id=validated_data['recipient_id'])
        message = Message.objects.create(
            sender=request.user,
            recipient=recipient,
            content=validated_data['content']
        )
        return message


class ConversationSerializer(serializers.Serializer):
    """Conversation serializer with partner info and last message"""
    user = MemberShortSerializer()
    last_message = MessageSerializer(allow_null=True)
    unread_count = serializers.IntegerField()
