from rest_framework import serializers
from .models import Note, Tag, ImageAttachment, Folder
from django.contrib.auth.models import User
from dj_rest_auth.serializers import PasswordResetSerializer
from allauth.account.utils import user_pk_to_url_str
from django.conf import settings

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'created_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class NoteLinkSerializer(serializers.ModelSerializer):
    """
    Serializer for links display
    :returns - Objects {id: 1, title: 'Graph'}
    """
    class  Meta:
        model = Note
        fields = ['id', 'title']

class NoteListSerializer(serializers.ModelSerializer):
    """
    Serializer for list of notes
    :returns - Object
    {
        "id": 1,
        "title": "Note A",
        "updated_at": "2026-02-11T21:08:52.587035Z"
    }
    """
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'updated_at', 'tags', 'folders', 'is_public']

class NoteDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for a detailed note
    :returns Object example
    {
        "id": 1,
        "title": "Note A",
        "content": "testing",
        "created_at": "2026-02-11T21:08:52.587035Z",
        "updated_at": "2026-02-11T21:08:52.587044Z",
        "links": [],
        "backlinks": [
            {
                "id": 2,
                "title": "Note B"
            }
        ]
    }
    """
    links = NoteLinkSerializer(many=True, read_only=True)
    backlinks =  NoteLinkSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at',
                  'updated_at', 'links', 'backlinks', 'tags', 'folders',
                  'is_public', 'public_id', 'shared_with']

        read_only_fields = ['public_id']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ImageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageAttachment
        fields = ['id', 'image', 'uploaded_at']

def frontend_url_generator(request, user, temp_key):
    uid = user_pk_to_url_str(user)
    return f"{settings.FRONTEND_URL}/reset-password/{uid}/{temp_key}/"

class CustomPasswordResetSerializer(PasswordResetSerializer):
    def get_email_options(self):
        return {
            'url_generator': frontend_url_generator,
        }