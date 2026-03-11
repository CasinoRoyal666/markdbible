import pytest
from django.template.defaultfilters import title

from ..models import Note, Tag
from .factories import NoteFactory, UserFactory

@pytest.mark.django_db
class TestNoteLogic:
    def test_auto_linking(self):
        """Check that if we create Note B with link to [[Note A]] connection will be created"""
        user = UserFactory()
        note_a = NoteFactory(user=user, title="TargetNote")
        note_b = NoteFactory(user=user, title="Source Note", content="Check this [[TargetNote]] link")

        # check if link was created automatically
        assert note_b.links.count() == 1
        assert note_b.links.first() == note_a

        # check backlinks
        assert note_a.backlinks.count() == 1
        assert note_a.backlinks.first() == note_b

    def test_auto_tagging(self):
        """check that hashtags #tag parsing from text"""
        user = UserFactory()

        note = NoteFactory(user=user, content="This is #python project build on #django framework")

        #check tags
        assert Tag.objects.count() == 2
        assert note.tags.count() == 2

        tag_names = [t.name for t in note.tags.all()]
        assert "python" in tag_names
        assert "django" in tag_names

    def test_links_only_same_user(self):
        """privacy check - user1 cannot refer to user2 note even if the names are the same"""
        user1 = UserFactory()
        user2 = UserFactory()

        note_u1 = NoteFactory(user=user1, title="Secret")
        note_u2 = NoteFactory(user=user2, content="hehe i steal [[Secrets]] uhahaha")

        assert note_u2.links.count() == 0