from dj_rest_auth.views import PasswordResetView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Folder, ImageAttachment, Note
from .serializers import (
    CustomPasswordResetSerializer,
    FolderSerializer,
    ImageAttachmentSerializer,
    NoteDetailSerializer,
    NoteListSerializer,
    UserSerializer,
)

# TODO: Move this variables into separate file for code cleanliness

WELCOME_NOTE_TITLE = "Добро пожаловать в MarkDBible!"

WELCOME_NOTE_CONTENT = """\
# Добро пожаловать в MarkDBible!

Эта заметка создана автоматически, чтобы помочь вам начать работу.
Удалите её, когда освоитесь.

---

## Основы Markdown

### Заголовки

```
# Заголовок 1
## Заголовок 2
### Заголовок 3
```

### Форматирование текста


`**жирный**` - **жирный**
`*курсив*` - *курсив*
`~~зачёркнутый~~` - ~~зачёркнутый~~
`` `код` `` - `код`

### Списки

- Пункт 1
- Пункт 2
  - Вложенный

1. Первый
2. Второй
3. Третий

---

## Возможности MarkDBible

### Wiki-ссылки

Оберните название заметки в двойные квадратные скобки, чтобы создать связь:

Я читал [[Атомные привычки]] и вспомнил о [[Глубокая работа]].

При сохранении MarkDBible автоматически построит связи. Вы увидите их в **Graph View**.

### Хештеги

Добавляйте `#хештеги` в текст заметки:

Сегодняшние заметки.
#work #meet

Теги извлекаются автоматически и отображаются в списке заметок.

### Папки

Используйте боковую панель для создания папок и подпапок. Перетаскивайте заметки для порядка.

### Публикация

Откройте заметку и включите **Сделать публичной** — получите ссылку для доступа без регистрации.

### Graph View

Нажмите иконку графа в боковой панели, чтобы увидеть связи между заметками.

### Изображения

Перетащите изображение в редактор или вставьте из буфера (`Ctrl+V`).

---

> **Совет:** Удалите эту заметку, когда будете готовы — это обычная заметка.
"""


def create_welcome_note(user):
    """Create an onboarding note for a newly registered user."""
    return Note.objects.create(
        user=user,
        title=WELCOME_NOTE_TITLE,
        content=WELCOME_NOTE_CONTENT,
        is_public=False,
    )


# registration view - allow registration to ANY
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=request.data.get("username"))
        create_welcome_note(user)
        return response


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
        if self.action == "list":
            return NoteListSerializer
        return NoteDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Api for graph
    # GET /api/notes/graph/
    @action(detail=False, methods=["get"])
    def graph(self, request):
        """
        Graph info
        :param request:
        :return: json with list on notes and their links
        """
        notes = self.get_queryset()

        nodes_data = [
            {
                "id": note.id,
                "label": note.title,
                "folder_id": note.folders_id,
                "folder_name": note.folders.name if note.folders else None,
                "tags": [tag.name for tag in note.tags.all()],
            }
            for note in notes
        ]

        edge_ids = set()
        edges_data = []
        for note in notes:
            for link in note.links.all():
                edges_data.append({"source": note.id, "target": link.id})

        return Response({"nodes": nodes_data, "links": edges_data})


class ImageAttachmentViewSet(viewsets.ModelViewSet):
    queryset = ImageAttachment.objects.all()
    serializer_class = ImageAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # we accept files, not JSON!
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return ImageAttachment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # return only folders of current user
        return Folder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PublicNoteView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NoteDetailSerializer

    def get_object(self):
        public_id = self.kwargs["public_id"]
        return get_object_or_404(Note, public_id=public_id, is_public=True)


# password reset
class CustomPasswordResetView(PasswordResetView):
    serializer_class = CustomPasswordResetSerializer
