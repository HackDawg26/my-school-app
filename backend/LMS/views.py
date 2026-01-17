from rest_framework import viewsets,status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from .models import Section, Student, Subject
from .serializers import LoginSerializer, SubjectSerializer, TeacherSerializer, UserSerializer, SectionSerializer, StudentSerializer

User = get_user_model()


class SectionViewSet(ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="students")
    def students(self, request, pk=None):
        students = Student.objects.filter(section_id=pk)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.prefetch_related("teachers")
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    # ---------------------------
    # ASSIGN TEACHER TO SUBJECT
    # ---------------------------
    @action(detail=True, methods=["post"], url_path="assign-teacher")
    def assign_teacher(self, request, pk=None):
        subject = self.get_object()
        teacher_id = request.data.get("teacher_id")

        if not teacher_id:
            return Response(
                {"detail": "teacher_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            teacher = User.objects.get(id=teacher_id, role="TEACHER")
        except User.DoesNotExist:
            return Response(
                {"detail": "Teacher not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        subject.teachers.add(teacher)
        return Response(
            {"detail": "Teacher assigned successfully"},
            status=status.HTTP_200_OK,
        )

    # ---------------------------
    # REMOVE TEACHER FROM SUBJECT
    # ---------------------------
    @action(detail=True, methods=["post","patch"], url_path="remove-teacher")
    def remove_teacher(self, request, pk=None):
        subject = self.get_object()
        teacher_id = request.data.get("teacher_id")

        if not teacher_id:
            return Response(
                {"detail": "teacher_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject.teachers.remove(teacher_id)
        return Response(
            {"detail": "Teacher removed successfully"},
            status=status.HTTP_200_OK,
        )
    @action(detail=True, methods=["get"], url_path="teachers")
    def list_teachers(self, request, pk=None):
        subject = self.get_object()
        teachers = subject.teachers.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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

class StudentViewSet(ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Student.objects.select_related("user", "section")

        grade = self.request.query_params.get("grade_level")
        section = self.request.query_params.get("section")

        # 🔹 Filter by grade level
        if grade:
            queryset = queryset.filter(grade_level=grade)

        # 🔹 Unassigned students
        if section == "null":
            queryset = queryset.filter(section__isnull=True)

        return queryset

class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role="TEACHER")
    serializer_class = TeacherSerializer

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