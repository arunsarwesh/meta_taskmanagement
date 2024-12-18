from django.db import models
from django.contrib.auth.models import User


class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance", null=True)
    username = models.CharField(max_length=100, null=True)
    latitude = models.CharField(max_length=100, null=True)
    longitude = models.CharField(max_length=100, null=True)
    time = models.DateTimeField(null=True)


# Course Table
class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses", null=True)
    course_name = models.CharField(max_length=100, null=True)
    username = models.CharField(max_length=100, null=True)
    platform = models.CharField(max_length=100, null=True)
    certificate = models.FileField(upload_to='certificates/', null=True, default='certificates/default_certificate.pdf')
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)
    def __str__(self):
        return self.course_name
    
#work reports
class work(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="work", null=True)
    username = models.CharField(max_length=100, null=True)
    title = models.CharField(max_length=500)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    media = models.FileField(upload_to='proofs/', null=True)

    def get_media(self, obj):
        request = self.context.get('request')
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None
    
# Project Table
class Project(models.Model):
    username = models.CharField(max_length=100, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects", null=True)
    project_title = models.CharField(max_length=150, null=True)
    description = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    due_at = models.DateTimeField(null=True)
    proof = models.FileField(upload_to='projects/', null=True)


# Profile Table
class Profile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name="profile", 
        null=True
    )
    name = models.CharField(max_length=100, null=True)
    domain = models.CharField(max_length=100, null=True)
    linkedin_url = models.URLField(null=True)
    github_url = models.URLField(null=True)
    mail_id = models.EmailField(null=True)
    phone_no = models.CharField(max_length=15, null=True)
    profile_photo = models.ImageField(upload_to='profiles/', null=True)
    about = models.TextField(null=True)
    
    def get_media(self, obj):
        request = self.context.get('request')
        if obj.profile_photo and request:
            return request.build_absolute_uri(obj.media.url)
        return None

