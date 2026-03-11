import factory
from django.contrib.auth.models import User
from ..models import Note

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')

class NoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Note

    title = factory.Sequence(lambda n:f'Note {n}')
    content = "Some content"
    user = factory.SubFactory(UserFactory)