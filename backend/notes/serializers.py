from rest_framework import serializers
from .models import Note

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
    class Meta:
        model = Note
        fields = ['id', 'title', 'updated_at']

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

    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at', 'links', 'backlinks']
