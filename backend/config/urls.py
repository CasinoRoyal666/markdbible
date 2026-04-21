from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from dj_rest_auth.views import PasswordResetConfirmView
from notes.views import CustomPasswordResetView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),

    #authorization endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #(login, password) -> token
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),

    #password reset endpoint
    path('api/password-reset/', CustomPasswordResetView.as_view(), name='rest_password_reset'),
    path('api/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)