from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note, ImageAttachment
from .serializers import NoteListSerializer, NoteDetailSerializer, UserSerializer, ImageAttachmentSerializer
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth.models import User

# registration view - allow registration to ANY
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

# note views - only for authenticated users
class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        List of notes
        :return: List of notes of current user (if user not anon)
        """

        return Note.objects.filter(user=self.request.user)
        # for testing only
        # return Note.objects.all()


    def get_serializer_class(self):
        """
        Choose what serializer using
        :return: if  list - > NoteListSerializer else NoteDetailSerializer
        """
        if self.action == 'list':
            return NoteListSerializer
        return NoteDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Api for graph
    # GET /api/notes/graph/
    @action(detail=False, methods=['get'])
    def graph(self, request):
        """
        Graph info
        :param request:
        :return: json with list on notes and their links
        """
        notes = self.get_queryset()

        nodes_data = [{'id': note.id, 'label': note.title} for note in notes]

        edge_ids = set()
        edges_data = []
        for note in notes:
            for link in note.links.all():
                edges_data.append({
                    'source': note.id,
                    'target': link.id
                })

        return Response({
            'nodes': nodes_data,
            'links': edges_data
        })

class ImageAttachmentViewSet(viewsets.ModelViewSet):
    queryset = ImageAttachment.objects.all()
    serializer_class = ImageAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    #we accept files, not json!
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return ImageAttachment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)