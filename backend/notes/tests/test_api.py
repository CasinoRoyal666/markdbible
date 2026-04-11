import pytest
from rest_framework.test import APIClient
from .factories import UserFactory, NoteFactory, FolderFactory
from ..models import Note
from ..views import WELCOME_NOTE_TITLE

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

@pytest.mark.django_db
class TestFolderApi:
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.url = '/api/folders/'

    def test_anonymous_cannot_access_folders(self):
        response = self.client.get(self.url)
        assert response.status_code == 401

    def test_create_folder(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'name': 'Work'})
        assert response.status_code == 201
        assert response.data['name'] == 'Work'

    def test_delete_empty_folder(self):
        folder = FolderFactory(user=self.user)
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'{self.url}{folder.id}/')
        assert response.status_code == 204
        from ..models import Folder
        assert not Folder.objects.filter(id=folder.id).exists()

    def test_delete_folder_cascade_notes(self):
        folder = FolderFactory(user=self.user)
        note = NoteFactory(user=self.user, folders=folder)
        self.client.force_authenticate(user=self.user)
        self.client.delete(f'{self.url}{folder.id}/')
        from ..models import Note
        assert not Note.objects.filter(id=note.id).exists()

    def test_delete_folder_cascades_subfolders(self):
        parent = FolderFactory(user=self.user)
        child = FolderFactory(user=self.user, parent=parent)
        self.client.force_authenticate(user=self.user)
        self.client.delete(f'{self.url}{parent.id}/')
        from ..models import Folder
        assert not Folder.objects.filter(id=child.id).exists()

    def test_user_sees_only_own_folders(self):
        FolderFactory(user=self.user, name='My Folder')
        other_user = UserFactory()
        FolderFactory(user=other_user, name='Not My Folder')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['name'] == 'My Folder'


@pytest.mark.django_db
class TestRegistrationOnboarding:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = '/api/register/'

    def test_registration_creates_welcome_note(self):
        response = self.client.post(self.register_url, {
            'username': 'newuser',
            'password': 'StrongPass123!',
            'email': 'newuser@example.com',
        })
        assert response.status_code == 201
        assert Note.objects.filter(
            user__username='newuser',
            title=WELCOME_NOTE_TITLE,
        ).exists()

    def test_welcome_note_is_private(self):
        self.client.post(self.register_url, {
            'username': 'newuser2',
            'password': 'StrongPass123!',
            'email': 'newuser2@example.com',
        })
        note = Note.objects.get(user__username='newuser2', title=WELCOME_NOTE_TITLE)
        assert note.is_public is False

    def test_welcome_note_contains_markdown_basics(self):
        self.client.post(self.register_url, {
            'username': 'newuser3',
            'password': 'StrongPass123!',
            'email': 'newuser3@example.com',
        })
        note = Note.objects.get(user__username='newuser3', title=WELCOME_NOTE_TITLE)
        assert '**bold**' in note.content
        assert '*italic*' in note.content
        assert '- [ ]' in note.content

    def test_welcome_note_contains_app_features(self):
        self.client.post(self.register_url, {
            'username': 'newuser4',
            'password': 'StrongPass123!',
            'email': 'newuser4@example.com',
        })
        note = Note.objects.get(user__username='newuser4', title=WELCOME_NOTE_TITLE)
        # wikilinks feature
        assert '[[' in note.content
        # hashtags feature
        assert '#' in note.content

    def test_each_user_gets_own_welcome_note(self):
        for i in range(1, 4):
            self.client.post(self.register_url, {
                'username': f'multi_user_{i}',
                'password': 'StrongPass123!',
                'email': f'multi{i}@example.com',
            })
        assert Note.objects.filter(title=WELCOME_NOTE_TITLE).count() == 3
