import pytest
from rest_framework.test import APIClient
from .factories import UserFactory, NoteFactory

@pytest.mark.django_db
class TestNoteAPI:
    def setup_method(self):
        #runs before each test
        self.client = APIClient()
        self.user = UserFactory()
        self.url = '/api/notes/'

    def test_anonymous_cannot_see_notes(self):
        # anon user get 401 Unauthorized
        response = self.client.get(self.url)
        assert response.status_code == 401

    def test_user_sees_only_own_notes(self):
        my_note = NoteFactory(user=self.user, title="My Note")
        other_user = UserFactory()
        other_note = NoteFactory(user=other_user, title="Not My Note")

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        assert response.status_code == 200
        data = response.json()

        assert len(data) == 1
        assert data[0]['title'] == 'My Note'