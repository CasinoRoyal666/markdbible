import re
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Folder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name', 'parent')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50, db_index=True)

    class Meta:
        unique_together = ('user', 'name')

    def __str__(self):
        return self.name

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    folders = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    title = models.CharField(max_length=255, db_index=True)
    content = models.TextField(blank=True, default="")

    #links in notes. symmetrical=False: If A refers to B, it doesn't mean that B refers to A.
    # related_name='backlinks': Will allow you to get all notes that link to the current one.
    links = models.ManyToManyField('self', symmetrical=False, related_name='backlinks', blank=True)

    #tags
    tags = models.ManyToManyField(Tag, related_name='notes', blank=True)

    # shared notes features
    is_public = models.BooleanField(default=False)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    shared_with = models.ManyToManyField(User, related_name='shared_notes', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'title')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.user.username})"

#auto linking logic
# @receiver(post_save, sender=Note)
# def update_note_links(sender, instance, created, **kwargs):
#     """
#     This function runs every time a note is saved.
#     It parses the text, finds [[Links]], and updates the links in the database.
#     :param sender:
#     :param instance:
#     :param created:
#     :param kwargs:
#     :return:
#     """
#     pattern = r'\[\[(.*?)\]\]'
#     found_titles = re.findall(pattern, instance.content)
#
#     #Clean the list of founded titles
#     clean_titles = {title.split('|')[0].strip() for title in found_titles}
#
#     if not clean_titles:
#         instance.links.clear()
#         return
#
#     linked_notes = Note.objects.filter(
#         user = instance.user,
#         title__in=clean_titles
#     )
#
#     instance.links.set(linked_notes)

@receiver(post_save, sender=Note)
def update_note_links(sender, instance, created, **kwargs):
    # [[wikilinks]] parsing
    link_pattern = r'\[\[(.*?)\]\]'
    found_titles = re.findall(link_pattern, instance.content)
    clean_titles = {title.split('|')[0].strip() for title in found_titles}

    if clean_titles:
        linked_notes = Note.objects.filter(user=instance.user, title__in=clean_titles)
        instance.links.set(linked_notes)
    else:
        instance.links.clear()

    # hashtags parsing
    # search for words that starts with '#'
    tag_pattern = r'#(\w+)'
    found_tags = re.findall(tag_pattern, instance.content)

    # clear duplicates with set()
    unique_tags = set(found_tags)

    tag_objects = []
    for tag_name in unique_tags:
        # get_or_create: if the tag exists - take it, if not - create it.
        tag, _ = Tag.objects.get_or_create(user=instance.user, name=tag_name)
        tag_objects.append(tag)

    # update the links (set will replace the old tag list with the new)
    instance.tags.set(tag_objects)

class ImageAttachment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='note_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} by {self.user.username}"