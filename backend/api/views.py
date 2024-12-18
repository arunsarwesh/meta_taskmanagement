from django.shortcuts import get_object_or_404
from django.utils.timezone import make_aware
from datetime import datetime
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view,permission_classes
from .models import *
from .serializers import *
import re

# Regex pattern for validating URLs (LinkedIn and GitHub)
URL_REGEX = re.compile(r"^(https?:\/\/)?([\w\d-]+\.)+[\w]{2,}(\/.+)*\/?$")

class AttendanceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attendance = Attendance.objects.all()
        serializer = AttendanceSerializer(attendance, many=True, context={"request": request})
        return Response(serializer.data)


class CourseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        courses = Course.objects.filter(user_id=pk).order_by("-id")  # Use 'filter()' to fetch all courses for the user        
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)



class WorkListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        works = work.objects.filter(user__id=pk).order_by("-id")  # Use 'filter()' to fetch all works for the user
       
        serializer = WorkSerializer(works, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)



class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        projects = Project.objects.filter(user__id=pk).order_by("-id")  # Use 'filter()' to fetch all projects for the user        
        serializer = ProjectSerializer(projects, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)



class ProfileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = Profile.objects.all()
        serializer = ProfileSerializer(profiles, many=True, context={"request": request})
        return Response(serializer.data)
    
class MemberListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = Profile.objects.all()
        members = []

        for profile in profiles:
            user = profile.user
            project_count = Project.objects.filter(user=user).count()
            course_count = Course.objects.filter(user=user).count()

            members.append({
                "id": user.id,
                "username": user.username,
                "name": profile.name,
                "expertise": profile.domain,
                "profile_picture": request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None,
                "linkedin": profile.linkedin_url,
                "github": profile.github_url,
                "project_count": project_count,
                "courses_completed": course_count,
            })

        return Response(members)


class StatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Total counts
        total_profiles = Profile.objects.count()
        total_projects = Project.objects.count()

        # Individual counts
        user_data = []
        for user in User.objects.all():
            profile_count = Profile.objects.filter(user=user).count()
            project_count = Project.objects.filter(user=user).count()

            user_data.append({
                "username": user.username,
                "profile_count": profile_count,
                "project_count": project_count,
            })

        response_data = {
            "total_profiles": total_profiles,
            "total_projects": total_projects,
            "individual_counts": user_data,
        }

        return Response(response_data)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Check if the user is a staff user
        if not user.is_staff:
            raise serializers.ValidationError("Only staff users can log in.")

        # Include any additional data you want to return
        data["username"] = user.username
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

        

# SignUp API view
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]




# Profile View (For both GET and POST requests)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def validate_url(self, url):
        """Validate if the provided URL is valid."""
        validator = URLValidator()
        try:
            validator(url)
            return True
        except ValidationError:
            return False

    def get(self, request, username=None):
        """Retrieve the profile for the given username or authenticated user."""
        if username is None:
            username = request.user.username

        try:
            profile = Profile.objects.get(user__username=username)
            serializer = ProfileSerializer(profile, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"error": "Profile does not exist"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Create or update the profile for the authenticated user."""
        user = request.data.get("username")
        user_instance = User.objects.filter(username=user).first()

        if not user_instance:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Getting the rest of the data
        name = request.data.get('name')
        domain = request.data.get('domain')
        linkedin_url = request.data.get('linkedin_url')
        github_url = request.data.get('github_url')
        mail_id = request.data.get('mail_id')
        phone_no = request.data.get('phone_no')
        about = request.data.get('about')
        profile_photo = request.FILES.get('profile_photo')  # Get the profile photo from request.FILES

        # Validate LinkedIn and GitHub URLs if provided
        if linkedin_url != 'No information provided':
            if linkedin_url and not self.validate_url(linkedin_url):
                return Response({"error": "Invalid LinkedIn URL"}, status=status.HTTP_400_BAD_REQUEST)
        if github_url != 'No information provided':
            if github_url and not self.validate_url(github_url):
                return Response({"error": "Invalid GitHub URL"}, status=status.HTTP_400_BAD_REQUEST)

        # Create or update the profile
        profile, created = Profile.objects.update_or_create(
            user=user_instance,
            defaults={
                'name': name,
                'domain': domain,
                'linkedin_url': linkedin_url,
                'github_url': github_url,
                'mail_id': mail_id,
                'phone_no': phone_no,
                'about': about,
                'profile_photo': profile_photo
            }
        )

        # Serialize and return the created or updated profile
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

# Attendance View 
class AttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            username = request.data.get("username")
            time = request.data.get("time")
            if not username:
                return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            user_instance = User.objects.filter(username=username).first()
            if not user_instance:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


            attendance_time = datetime.strptime(time, "%Y-%m-%d %H:%M:%S")
                        
            # Save aware_datetime to the database
            attendance_record = Attendance.objects.create(
                user=user_instance,
                username=username,
                latitude=request.data.get("latitude"),
                longitude=request.data.get("longitude"),
                time=attendance_time
            )

            serializer = AttendanceSerializer(attendance_record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": "Invalid data", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An unexpected error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class WorkDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):  # Change 'id' to 'pk'
        try:
            work_report = work.objects.get(id=pk)  # Use 'pk' to fetch the report
            serializer = WorkSerializer(work_report, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except work.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):  # Accept pk for DELETE method
        try:
            work_report = work.objects.get(id=pk)
            work_report.delete()  # Delete the report
            return Response({"message": "Report deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except work.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

class Workview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        title = request.data.get("title")
        description = request.data.get("description")
        media = request.FILES.get("media")

        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

        user_instance = User.objects.filter(username=username).first()

        if not user_instance:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create the work report
        try:
            work_report = work.objects.create(
                user=user_instance,
                username=username,
                title=title,
                description=description,
                media=media,
            )
        except Exception as e:
            return Response({"error": f"Failed to create work report: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and return the created work report
        serializer = WorkSerializer(work_report, context={"request": request})
        return Response(
            {"message": "Work report created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        # Fetch all reports for the authenticated user
        reports = work.objects.filter(user=request.user).order_by("-id")
        serializer = WorkSerializer(reports, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            course = Course.objects.get(id=pk)  # Use 'pk' to fetch the course
            serializer = CourseSerializer(course, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):  # Accept pk for DELETE method
        try:
            course = Course.objects.get(id=pk)
            course.delete()  # Delete the course
            return Response({"message": "Course deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)


class CourseView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        course_name = request.data.get("course_name")  # Adjusted field name
        platform = request.data.get("platform")
        certificate = request.FILES.get("certificate")  # Ensure you're sending correct file key

        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

        user_instance = User.objects.filter(username=username).first()

        if not user_instance:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            course = Course.objects.create(
                user=user_instance,
                username=username,
                course_name=course_name,
                platform=platform,
                certificate=certificate,
            )
        except Exception as e:
            return Response({"error": f"Failed to create course: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CourseSerializer(course, context={"request": request})
        return Response(
            {"message": "Course created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        courses = Course.objects.filter(user=request.user).order_by("-id")
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):  # Change 'id' to 'pk'
        try:
            Project_report = Project.objects.get(id=pk)  # Use 'pk' to fetch the report
            serializer = ProjectSerializer(Project_report, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):  # Accept pk for DELETE method
        try:
            Project_report = Project.objects.get(id=pk)
            Project_report.delete()  # Delete the report
            return Response({"message": "Report deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Project.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)



class ProjectView(APIView):
    permission_classes = [IsAuthenticated]
from datetime import datetime
from django.utils import timezone

class ProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        project_title = request.data.get("title")
        description = request.data.get("description")
        due_at_str = request.data.get("due_at")  # due_at as a string
        proof = request.FILES.get("media")

        # Check if username is provided
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user instance
        user_instance = User.objects.filter(username=username).first()
        if not user_instance:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate due_at
        due_at = None
        if due_at_str:
            try:
                due_at = datetime.fromisoformat(due_at_str)  # Parse the string into a datetime object
                if timezone.is_naive(due_at):  # Check if it's naive (no timezone)
                    due_at = timezone.make_aware(due_at)  # Convert it to aware datetime
            except ValueError:
                return Response({"error": "Invalid date format for 'due_at'"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the project report
        try:
            project_report = Project.objects.create(
                user=user_instance,
                username=username,
                project_title=project_title,
                description=description,
                due_at=due_at,
                proof=proof,
            )
        except Exception as e:
            return Response({"error": f"Failed to create project: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and return the created project
        serializer = ProjectSerializer(project_report, context={"request": request})
        return Response(
            {"message": "Project created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        # Fetch all reports for the authenticated user
        reports = Project.objects.filter(user=request.user).order_by("-id")
        serializer = ProjectSerializer(reports, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
