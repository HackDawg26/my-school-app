from rest_framework import viewsets,status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from .models import Section, Student
from .serializers import LoginSerializer, UserSerializer, SectionSerializer

User = get_user_model()

class SectionViewSet(ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

    @action(detail=True, methods=["post"])
    def assign_students(self, request, pk=None):

        section = self.get_object()
        student_ids = request.data.get("student_ids", [])

        if not isinstance(student_ids, list):
            return Response({"detail": "student_ids must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        # Update section for all selected students
        updated_count = Student.objects.filter(id__in=student_ids).update(section=section)
        return Response({"message": f"{updated_count} students assigned to {section.name}"}, status=status.HTTP_200_OK)

    
@api_view(["POST"])
def assign_students_to_section(request, section_id):
    student_ids = request.data.get("student_ids", [])
    section = get_object_or_404(Section, id=section_id)

    Student.objects.filter(id__in=student_ids).update(section=section)

    return Response({"message": "Students assigned successfully"})
# =========================
# CREATE USER (ADMIN ONLY)
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_user(request):
    if request.user.role != "ADMIN":
        return Response(
            {"detail": "Not authorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = UserSerializer(
        data=request.data,
        context={"request": request}
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        {"message": "User created successfully"},
        status=status.HTTP_201_CREATED
    )


# =========================
# LIST USERS (ADMIN ONLY)
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    if request.user.role != "ADMIN":
        return Response(
            {"detail": "Not authorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    users = User.objects.all().order_by("-id")
    serializer = UserSerializer(users, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def students_by_grade(request):
    grade_level = request.GET.get("grade_level")

    if not grade_level:
        return Response({"detail": "grade_level is required"}, status=400)

    students = User.objects.filter(
        role="STUDENT",
        student_profile__grade_level=grade_level
    ).select_related("student_profile")

    serializer = UserSerializer(students, many=True)
    return Response(serializer.data)



@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    if request.user.role != "ADMIN":
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(User, pk=pk)

    if request.method == "GET":
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# =========================
# LOGIN
# =========================
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
