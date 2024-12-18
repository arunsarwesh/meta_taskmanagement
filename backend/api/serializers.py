from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Include all fields except `last_login` and `is_superuser`
        fields = [
            "id", "username", "password", "first_name", "last_name", 
            "email", "is_staff"
        ]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        # Use `create_user` to handle password hashing
        user = User.objects.create_user(**validated_data)
        return user

class AttendanceSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()  # Add 'name' field
    class Meta:
        model = Attendance
        fields = ['latitude', 'longitude', 'user_id', 'time', 'username', 'name']

    def get_name(self, obj):
        # Fetch the 'name' from the related Profile model
        profile = Profile.objects.filter(user=obj.user).first()  # Assuming 'user' is a ForeignKey to the User model in Attendance
        if profile:
            return profile.name
        return None 

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
    def get_media(self, obj):
        request = self.context.get('request')
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None

class WorkSerializer(serializers.ModelSerializer):
    media = serializers.SerializerMethodField()

    class Meta:
        model = work
        fields = ['id', 'title', 'description', 'media', 'created_at', 'username', 'user']

    def get_media(self, obj):
        request = self.context.get('request')
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
    def get_media(self, obj):
        request = self.context.get('request')
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None



class ProfileSerializer(serializers.ModelSerializer):
    media = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user', 'name', 'domain', 'linkedin_url', 'github_url', 'mail_id', 'phone_no', 'about', 'user_id', 'profile_photo', 'media']

    def get_media(self, obj):
        request = self.context.get('request')
        if obj.profile_photo and request:  # Using 'profile_photo' from the model
            return request.build_absolute_uri(obj.profile_photo.url)
        return None


class AdminSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    course_count = serializers.SerializerMethodField()
    work_count = serializers.SerializerMethodField()
    attendance_count = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'name', 'domain', 'linkedin_url', 'github_url', 
            'mail_id', 'phone_no', 'profile_photo',
            'project_count', 'course_count', 'work_count', 'attendance_count'
        ]

    def get_project_count(self, obj):
        return Project.objects.filter(user=obj.user).count()

    def get_course_count(self, obj):
        return Course.objects.filter(user=obj.user).count()

    def get_work_count(self, obj):
        return work.objects.filter(user=obj.user).count()

    def get_attendance_count(self, obj):
        return Attendance.objects.filter(user=obj.user).count()
