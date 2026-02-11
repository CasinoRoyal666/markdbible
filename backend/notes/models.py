import re
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255, db_index=True)
    content = models.TextField(blank=True, default="")

    #links in notes. symmetrical=False: If A refers to B, it doesn't mean that B refers to A.
    # related_name='backlinks': Will allow you to get all notes that link to the current one.
    links = models.ManyToManyField('self', symmetrical=False, related_name='backlinks', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'title')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.user.username})"

#auto linking logic
@receiver(post_save, sender=Note)
def update_note_links(sender, instance, created, **kwargs):
    """
    This function runs every time a note is saved.
    It parses the text, finds [[Links]], and updates the links in the database.
    :param sender:
    :param instance:
    :param created:
    :param kwargs:
    :return:
    """
    pattern = r'\[\[(.*?)\]\]'
    found_titles = re.findall(pattern, instance.content)

    #Clean the list of founded titles
    clean_titles = {title.split('|')[0].strip() for title in found_titles}

    if not clean_titles:
        instance.links.clear()
        return

    linked_notes = Note.objects.filter(
        user = instance.user,
        title__in=clean_titles
    )

    instance.links.set(linked_notes)



