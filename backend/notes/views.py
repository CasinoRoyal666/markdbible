from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Folder, ImageAttachment, Note
from .serializers import (
    FolderSerializer,
    ImageAttachmentSerializer,
    NoteDetailSerializer,
    NoteListSerializer,
    UserSerializer,
)
# TODO: Move this variables into separate file for code cleanliness

WELCOME_NOTE_TITLE = "Welcome to MarkDBible!"

WELCOME_NOTE_CONTENT = """\
# Welcome to MarkDBible!

This note was created automatically to help you get started.
Feel free to delete it once you're comfortable with the app.

---

## Markdown Basics

Markdown lets you format text with simple symbols.

### Headings

```
# Heading 1
## Heading 2
### Heading 3
```

### Text Styling

| Syntax | Result |
|--------|--------|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `~~strikethrough~~` | ~~strikethrough~~ |
| `` `inline code` `` | `inline code` |

### Lists

Unordered list:
- Item one
- Item two
  - Nested item

Ordered list:
1. First
2. Second
3. Third

Task list (checkboxes):
```
- [ ] Buy groceries
- [x] Read documentation
- [ ] Write a note
```

### Blockquotes

```
> This is a blockquote.
> It can span multiple lines.
```

> This is a blockquote.

### Code Blocks

Use triple backticks for multi-line code:

```
python
def greet(name):
    return f"Hello, {name}!"
```

### Horizontal Rule

```
---
```

### Links and Images

```
[Link text](https://example.com)
![Alt text](https://example.com/image.png)
```

---

## MarkDBible Features

### Wikilinks — Connect Your Notes

Wrap any note title in double square brackets to create a link between notes, like in example below:

I was reading [[Atomic Habits]] and it reminded me of [[Deep Work]].

When you save, MarkDBible automatically builds connections. You can visualize them in the **Graph View**.

### Hashtags — Organize with Tags

Add `#hashtags` anywhere in the note body:

Today's standup notes. #work #meeting 

Tags are extracted automatically and shown in the note list — no manual tagging needed.

### Folders

Use the sidebar to create folders and sub-folders. Drag notes into folders to keep your knowledge base organized.

### Sharing

Open any note and toggle **Make Public** to get a shareable link. Anyone with the link can read the note — no account required.

### Graph View

Click the graph icon in the sidebar to see how your notes are connected via wikilinks. Great for discovering relationships in your knowledge base.

### Image Attachments

- Drag and drop an image into the editor, or
- Paste from clipboard (`Ctrl+V`)

Images are uploaded and embedded automatically.

---

> **Tip:** Delete this note whenever you're ready — it's just a regular note.
"""

# TODO: Add russian language support. System detects user language and generates welcome note with it
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
