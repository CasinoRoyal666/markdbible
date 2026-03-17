from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, RegisterView, ImageAttachmentViewSet, FolderViewSet, PublicNoteView

router = DefaultRouter()
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'images', ImageAttachmentViewSet, basename='image')
router.register(r'folders', FolderViewSet, basename='folder')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('shared/<uuid:public_id>/', PublicNoteView.as_view(), name='public_note'),
    path('', include(router.urls)),
]