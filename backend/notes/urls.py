from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, RegisterView, ImageAttachmentViewSet

router = DefaultRouter()
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'images', ImageAttachmentViewSet, basename='image')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('', include(router.urls)),
]