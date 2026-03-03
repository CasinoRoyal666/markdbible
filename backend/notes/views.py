from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note
from .serializers import NoteListSerializer, NoteDetailSerializer


from django.contrib.auth.models import User

class NoteViewSet(viewsets.ModelViewSet):
    # Only authorized users can do smthng
    # Commented for ezy testing
    #permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        List of notes
        :return: List of notes of current user (if user not anon)
        """

        # for testing only
        return Note.objects.all()


        # if self.request.user.is_anonymous:
        #     return Note.objects.none()
        # return Note.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """
        Choose what serializer using
        :return: if  list - > NoteListSerializer else NoteDetailSerializer
        """
        if self.action == 'list':
            return NoteListSerializer
        return NoteDetailSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_anonymous:
            user = User.objects.first()
        """
        Tie the created note to the authenticated user.
        :param serializer:
        :return:
        """
        serializer.save(user=user)
        #serializer.save(user=self.request.user)

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
