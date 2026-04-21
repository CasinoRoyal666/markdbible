import pytest
from django.core import mail
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from allauth.account.utils import user_pk_to_url_str
@pytest.mark.django_db
class TestPasswordResetRequest:
    def setup_method(self):
        self.client = APIClient()
        self.url = '/api/password-reset/'
    def test_reset_existing_email_sends_email(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        response = self.client.post(self.url, {'email': 'test@example.com'})
        assert response.status_code == 200
        assert len(mail.outbox) == 1
        assert 'test@example.com' in mail.outbox[0].to
    def test_reset_nonexistent_email_returns_200_no_leak(self):
        response = self.client.post(self.url, {'email': 'ghost@example.com'})
        assert response.status_code == 200
        assert len(mail.outbox) == 0
    def test_reset_without_email_returns_400(self):
        response = self.client.post(self.url, {})
        assert response.status_code == 400
    def test_reset_invalid_email_format_returns_400(self):
        response = self.client.post(self.url, {'email': 'not-an-email'})
        assert response.status_code == 400
@pytest.mark.django_db
class TestPasswordResetConfirm:
    def setup_method(self):
        self.client = APIClient()
        self.url = '/api/password-reset-confirm/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpassword123'
        )
        self.uid = user_pk_to_url_str(self.user)
        self.token = default_token_generator.make_token(self.user)
    def test_confirm_with_valid_token(self):
        response = self.client.post(self.url, {
            'uid': self.uid,
            'token': self.token,
            'new_password1': 'NewStrongPass1!',
            'new_password2': 'NewStrongPass1!',
        })
        print(response.data)
        assert response.status_code == 200
        self.user.refresh_from_db()
        assert self.user.check_password('NewStrongPass1!')
    def test_confirm_with_invalid_token(self):
        response = self.client.post(self.url, {
            'uid': self.uid,
            'token': 'invalid-token',
            'new_password1': 'NewStrongPass1!',
            'new_password2': 'NewStrongPass1!',
        })
        assert response.status_code == 400
    def test_confirm_with_invalid_uid(self):
        response = self.client.post(self.url, {
            'uid': '99999',
            'token': self.token,
            'new_password1': 'NewStrongPass1!',
            'new_password2': 'NewStrongPass1!',
        })
        assert response.status_code == 400
    def test_confirm_mismatched_passwords(self):
        response = self.client.post(self.url, {
            'uid': self.uid,
            'token': self.token,
            'new_password1': 'NewStrongPass1!',
            'new_password2': 'DifferentPass2!',
        })
        assert response.status_code == 400
    def test_confirm_short_password(self):
        response = self.client.post(self.url, {
            'uid': self.uid,
            'token': self.token,
            'new_password1': '1234',
            'new_password2': '1234',
        })
        assert response.status_code == 400
@pytest.mark.django_db
class TestRegistrationRequiresEmail:
    def setup_method(self):
        self.client = APIClient()
        self.url = '/api/register/'
    def test_register_without_email_returns_400(self):
        response = self.client.post(self.url, {
            'username': 'newuser',
            'password': 'strongpass123',
        })
        assert response.status_code == 400
    def test_register_with_email_returns_201(self):
        response = self.client.post(self.url, {
            'username': 'newuser',
            'password': 'strongpass123',
            'email': 'new@example.com',
        })
        assert response.status_code == 201