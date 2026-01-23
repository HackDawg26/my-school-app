<<<<<<< HEAD
from __future__ import annotations

from datetime import datetime

from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.views import APIView

=======
from django.utils import timezone
from httpx import request
from rest_framework import viewsets,status
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import (Section, Student, Subject, SubjectOffering, Quiz, QuizQuestion, QuizChoice, QuizAttempt, 
    QuizAnswer, Student, GradeForecast, QuizTopicPerformance,
    QuarterlyGrade)
from .serializers import (LoginSerializer, StudentSubjectOfferingSerializer, SubjectListSerializer, SubjectOfferingSerializer, SubjectSerializer, TeacherSerializer, UserSerializer, SectionSerializer, StudentSerializer,QuizSerializer, QuizCreateUpdateSerializer,
    QuizQuestionSerializer, StudentQuizSerializer, QuizAttemptSerializer,
    QuizSubmissionSerializer, QuizChoiceSerializer,
    GradeForecastSerializer, QuizTopicPerformanceSerializer,
    QuarterlyGradeSerializer, QuarterlyGradeCreateUpdateSerializer
)
>>>>>>> Backup
from .grade_analytics import GradeAnalyticsService
from .models import (
    GradeForecast,
    Quiz,
    QuizAnswer,
    QuizChoice,
    QuizAttempt,
    QuizQuestion,
    QuarterlyGrade,
    QuizTopicPerformance,
    Section,
    Student,
    Subject,
    SubjectOffering,
)
from .serializers import (
    GradeForecastSerializer,
    LoginSerializer,
    QuarterlyGradeCreateUpdateSerializer,
    QuarterlyGradeSerializer,
    QuizAttemptSerializer,
    QuizCreateUpdateSerializer,
    QuizQuestionSerializer,
    QuizSerializer,
    QuizSubmissionSerializer,
    QuizTopicPerformanceSerializer,
    StudentQuizSerializer,
    SectionSerializer,
    StudentSerializer,
    SubjectListSerializer,
    SubjectOfferingSerializer,
    SubjectSerializer,
    TeacherSerializer,
    UserSerializer,
)

User = get_user_model()


# ============================================================
# ADMIN DASHBOARD STATS
# ============================================================
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "students": User.objects.filter(role="STUDENT").count(),
                "teachers": User.objects.filter(role="TEACHER").count(),
                "subjects": Subject.objects.count(),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# SECTIONS
# ============================================================
class SectionViewSet(ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="students")
    def students(self, request, pk=None):
        students = Student.objects.filter(section_id=pk).select_related("user", "section")
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# SUBJECTS
# ============================================================
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
    @action(detail=True, methods=["post", "patch"], url_path="remove-teacher")
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

    # ---------------------------
    # LIST TEACHERS FOR SUBJECT
    # ---------------------------
    @action(detail=True, methods=["get"], url_path="teachers")
    def list_teachers(self, request, pk=None):
        subject = self.get_object()
        teachers = subject.teachers.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# TEACHER SUBJECT OFFERINGS (READ ONLY)
# ============================================================
class TeacherSubjectListViewSet(ReadOnlyModelViewSet):
    serializer_class = SubjectListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            SubjectOffering.objects.select_related("subject", "section")
            .filter(teacher=user, subject__is_active=True, section__is_active=True)
            .order_by("section__grade_level", "section__name")
        )

<<<<<<< HEAD

# ============================================================
# SUBJECT OFFERINGS
# ============================================================
=======
>>>>>>> Backup
class SubjectOfferingViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectOfferingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "TEACHER":
            return SubjectOffering.objects.filter(teacher=user)

        if user.role == "ADMIN":
            return SubjectOffering.objects.all()

        return SubjectOffering.objects.none()

    @action(detail=True, methods=["get"], url_path="students")
    def students(self, request, pk=None):
        offering = self.get_object()

        students_qs = (
            Student.objects.filter(section=offering.section)
            .select_related("user")
            .order_by("user__last_name", "user__first_name")
        )

        data = StudentSerializer(students_qs, many=True).data
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path=r"by-section/(?P<section_id>[^/.]+)")
    def by_section(self, request, section_id=None):
        offerings = self.get_queryset().filter(section_id=section_id)
        serializer = self.get_serializer(offerings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        section_id = self.request.data.get("section_id")
        if not section_id:
            return Response(
                {"section_id": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        section = get_object_or_404(Section, id=section_id)
        serializer.save(section=section, teacher=self.request.user)

<<<<<<< HEAD

# ============================================================
# ADMIN USER MANAGEMENT (ADMIN ONLY)
# ============================================================
=======
    @action(detail=True, methods=["get"], url_path="quizzes")
    def quizzes(self, request, pk=None):
        # IMPORTANT: FK field is SubjectOffering / SubjectOffering_id (NOT subject_offering)
        qs = Quiz.objects.filter(SubjectOffering_id=pk).order_by("-posted_at", "-created_at")
        return Response(QuizSerializer(qs, many=True).data)

    @action(detail=True, methods=["get"], url_path="recent-quiz-grades")
    def recent_quiz_grades(self, request, pk=None):
        attempts = (
            QuizAttempt.objects
            .filter(quiz__SubjectOffering_id=pk)
            .select_related("student__user", "quiz")
            .order_by("-submitted_at")[:10]
        )

        data = []
        for a in attempts:
            total = a.quiz.total_points or 0
            percent = round((a.score / total) * 100, 2) if total else 0
            student_name = f"{a.student.user.first_name} {a.student.user.last_name}".strip()

            data.append({
                "student": student_name,
                "quiz": a.quiz.title,
                "score": a.score,
                "total": total,
                "percent": percent,
                "submitted_at": a.submitted_at,
            })

        return Response(data)
    @action(detail=False, methods=["get"], url_path="my", permission_classes=[IsAuthenticated])
    def my_subject_offerings(self, request):
        """
        GET /api/subject-offerings/my/
        Returns subject offerings for the logged-in STUDENT based on their section.
        """
        user = request.user

        # Student profile should exist if user is a student
        student = getattr(user, "student_profile", None)
        if not student or not student.section:
            return Response([])

        offerings = SubjectOffering.objects.filter(section=student.section).order_by("name")
        serializer = self.get_serializer(offerings, many=True)
        return Response(serializer.data)
    
class StudentSubjectOfferingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Student view: list subject offerings for the logged-in student (based on their section),
    including quarterly progress + average.
    """
    serializer_class = StudentSubjectOfferingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != "STUDENT":
            return SubjectOffering.objects.none()

        try:
            student = Student.objects.select_related("section").get(user=user)
        except Student.DoesNotExist:
            return SubjectOffering.objects.none()

        if not student.section:
            return SubjectOffering.objects.none()

        return (
            SubjectOffering.objects
            .select_related("section", "teacher")
            .filter(section=student.section)
            .order_by("name")
        )

    def list(self, request, *args, **kwargs):
        qs = list(self.get_queryset())

        # attach computed fields using student's grades
        user = request.user
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        grades = (
            QuarterlyGrade.objects
            .filter(student=student, SubjectOffering__in=qs)
            .select_related("SubjectOffering")
        )

        by_offering = {}
        for g in grades:
            by_offering.setdefault(g.SubjectOffering_id, []).append(g)

        for o in qs:
            gs = by_offering.get(o.id, [])
            o._student_quarterly_grades = gs

            # progress = quarters encoded / 4 * 100
            progress = int((len({g.quarter for g in gs}) / 4) * 100) if gs else 0
            o.progress = progress

            # average = mean of available quarters (or 0)
            if gs:
                avg = sum(float(g.final_grade) for g in gs) / len(gs)
            else:
                avg = 0
            o.average = round(avg, 2)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="my-grades")
    def my_grades(self, request, pk=None):
        """
        Returns the student's quarterly grades for this subject offering.
        """
        user = request.user
        if user.role != "STUDENT":
            return Response({"detail": "Not authorized"}, status=403)

        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"detail": "Student profile not found"}, status=404)

        qs = QuarterlyGrade.objects.filter(student=student, Subject_Offering_id=pk).order_by("quarter")
        return Response(QuarterlyGradeSerializer(qs, many=True).data)
    @action(detail=True, methods=["get"], url_path="quizzes")
    def quizzes(self, request, pk=None):
        offering = self.get_object()
        qs = offering.quizzes.all().order_by("-id")  # uses related_name="quizzes"
        return Response(QuizSerializer(qs, many=True).data)
    
    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()

        student = getattr(request.user, "student_profile", None)
        if student:
            grades = QuarterlyGrade.objects.filter(student=student, SubjectOffering=obj).order_by("quarter")
            obj._student_quarterly_grades = list(grades)

        # optional: compute average + progress for detail view too
            gs = obj._student_quarterly_grades
            obj.progress = int((len({g.quarter for g in gs}) / 4) * 100) if gs else 0
            obj.average = round(sum(float(g.final_grade) for g in gs) / len(gs), 2) if gs else 0

        serializer = self.get_serializer(obj)
        return Response(serializer.data)
# =========================
# CREATE USER (ADMIN ONLY)
# =========================
>>>>>>> Backup
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_user(request):
    if request.user.role != "ADMIN":
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    if request.user.role != "ADMIN":
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all().order_by("-id")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    if request.user.role != "ADMIN":
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)

    if request.method == "GET":
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "PATCH":
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    user.delete()
    return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ============================================================
# STUDENTS (FILTERABLE)
# ============================================================
class StudentViewSet(ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Student.objects.select_related("user", "section")

        grade = self.request.query_params.get("grade_level")
        section = self.request.query_params.get("section")

        if grade:
            queryset = queryset.filter(grade_level=grade)

        if section == "null":
            queryset = queryset.filter(section__isnull=True)

        return queryset
    @action(detail=True, methods=["get"], url_path="quarterly-summary")
    def quarterly_summary(self, request, pk=None):
        student = self.get_object()

<<<<<<< HEAD

# ============================================================
# TEACHERS (READ ONLY)
# ============================================================
=======
        grades = (
            QuarterlyGrade.objects
            .filter(student=student)
            .select_related("SubjectOffering")
            .order_by("SubjectOffering_id", "quarter")
        )

        # group by offering
        by_offering = {}
        for g in grades:
            oid = g.SubjectOffering_id
            if oid not in by_offering:
                by_offering[oid] = {
                    "subject_offering_id": oid,
                    "subject": g.SubjectOffering.name,
                    "q1": None,
                    "q2": None,
                    "q3": None,
                    "q4": None,
                    "final": None,
                }

            if g.quarter == "Q1":
                by_offering[oid]["q1"] = g.final_grade
            elif g.quarter == "Q2":
                by_offering[oid]["q2"] = g.final_grade
            elif g.quarter == "Q3":
                by_offering[oid]["q3"] = g.final_grade
            elif g.quarter == "Q4":
                by_offering[oid]["q4"] = g.final_grade

        # compute final average (if at least one quarter exists)
        for item in by_offering.values():
            vals = [item["q1"], item["q2"], item["q3"], item["q4"]]
            vals = [v for v in vals if v is not None]
            item["final"] = round(sum(vals) / len(vals), 2) if vals else None

        return Response(list(by_offering.values()))
>>>>>>> Backup
class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role="TEACHER")
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# LOGIN
# ============================================================
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# ============================================================
# SIMPLE LIST ENDPOINTS
# ============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def subject_list(request):
    subjects = Subject.objects.all()
    return Response([{"id": s.id, "name": s.name} for s in subjects], status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_list(request):
    if request.user.role not in ["TEACHER", "ADMIN"]:
        return Response(
            {"error": "Only teachers and admins can access student list"},
            status=status.HTTP_403_FORBIDDEN,
        )

    students = Student.objects.select_related("user").all()
    return Response(
        [
            {
                "id": s.id,
                "student_id": getattr(s, "student_id", None),
                "name": f"{s.user.first_name} {s.user.last_name}",
                "email": s.user.email,
            }
            for s in students
        ],
        status=status.HTTP_200_OK,
    )


# ============================================================
# TEACHER QUIZ MANAGEMENT
# ============================================================
class TeacherQuizViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "TEACHER":
            return Quiz.objects.filter(teacher=self.request.user).order_by("-created_at")
        return Quiz.objects.none()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return QuizCreateUpdateSerializer
        return QuizSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        quiz = serializer.instance
        output_serializer = QuizSerializer(quiz)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def add_question(self, request, pk=None):
        quiz = self.get_object()
        serializer = QuizQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(quiz=quiz)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        questions = quiz.questions.all().order_by("order")
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def update_times(self, request, pk=None):
        """
        Accepts open_time and/or close_time as ISO strings, e.g.:
        - "2026-01-12T08:33:00.000Z"
        - "2026-01-12T23:56"
        """
        try:
            quiz = self.get_object()

            def _parse_any_datetime(value: str):
                # try strict ISO with Z
                try:
                    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
                except Exception:
                    v = value
                    if len(v) == 16:  # YYYY-MM-DDTHH:MM
                        v += ":00"
                    parsed = parse_datetime(v)

                if parsed and timezone.is_naive(parsed):
                    parsed = timezone.make_aware(parsed)
                return parsed

            if "open_time" in request.data:
                quiz.open_time = _parse_any_datetime(request.data["open_time"])

            if "close_time" in request.data:
                quiz.close_time = _parse_any_datetime(request.data["close_time"])

            quiz.save()
            serializer = self.get_serializer(quiz)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e), "detail": "Failed to update quiz times"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"])
    def attempts(self, request, pk=None):
        quiz = self.get_object()
        attempts = quiz.attempts.all().order_by("-started_at")
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def manage_quiz_question(request, question_id):
    try:
        question = QuizQuestion.objects.get(id=question_id, quiz__teacher=request.user)
    except QuizQuestion.DoesNotExist:
        return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = QuizQuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    question.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================
# STUDENT QUIZ ACCESS
# ============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_quizzes(request):
    if not hasattr(request.user, "student_profile"):
        return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    quizzes = Quiz.objects.exclude(status="DRAFT").order_by("open_time")
    serializer = StudentQuizSerializer(quizzes, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_quiz_detail(request, quiz_id):
    if not hasattr(request.user, "student_profile"):
        return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    quiz = get_object_or_404(Quiz, id=quiz_id)
    serializer = StudentQuizSerializer(quiz, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_quiz(request, quiz_id):
    if not hasattr(request.user, "student_profile"):
        return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    quiz = get_object_or_404(Quiz, id=quiz_id)

    if not quiz.is_open():
        return Response({"error": "Quiz is not currently open"}, status=status.HTTP_400_BAD_REQUEST)

    student = request.user.student_profile

    existing_attempt = QuizAttempt.objects.filter(
        quiz=quiz, student=student, status="IN_PROGRESS"
    ).first()

    questions = quiz.questions.all().order_by("order")
    questions_data = QuizQuestionSerializer(questions, many=True).data

    if existing_attempt:
        return Response(
            {
                "attempt_id": existing_attempt.id,
                "quiz": StudentQuizSerializer(quiz).data,
                "questions": questions_data,
                "started_at": existing_attempt.started_at,
            },
            status=status.HTTP_200_OK,
        )

    if not quiz.allow_multiple_attempts:
        prev_count = QuizAttempt.objects.filter(quiz=quiz, student=student).count()
        if prev_count > 0:
            return Response(
                {"error": "Multiple attempts not allowed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    attempt = QuizAttempt.objects.create(quiz=quiz, student=student)

    return Response(
        {
            "attempt_id": attempt.id,
            "quiz": StudentQuizSerializer(quiz).data,
            "questions": questions_data,
            "started_at": attempt.started_at,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_quiz(request, attempt_id):
    if not hasattr(request.user, "student_profile"):
        return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    try:
        attempt = QuizAttempt.objects.get(
            id=attempt_id,
            student=request.user.student_profile,
            status="IN_PROGRESS",
        )
    except QuizAttempt.DoesNotExist:
        return Response({"error": "Attempt not found"}, status=status.HTTP_404_NOT_FOUND)

    if not attempt.quiz.is_open():
        return Response({"error": "Quiz has closed"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = QuizSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    answers_data = serializer.validated_data["answers"]
    total_score = 0

    for answer_data in answers_data:
        question_id = answer_data.get("question_id")
        selected_choice_id = answer_data.get("selected_choice_id")
        text_answer = answer_data.get("text_answer", "")

        try:
            question = QuizQuestion.objects.get(id=question_id, quiz=attempt.quiz)
        except QuizQuestion.DoesNotExist:
            continue

        answer = QuizAnswer.objects.create(
            attempt=attempt,
            question=question,
            text_answer=text_answer,
        )

        if question.question_type in ["MULTIPLE_CHOICE", "TRUE_FALSE"] and selected_choice_id:
            try:
                choice = QuizChoice.objects.get(id=selected_choice_id, question=question)
                answer.selected_choice = choice
                answer.is_correct = choice.is_correct
                if choice.is_correct:
                    answer.points_earned = question.points
                    total_score += question.points
            except QuizChoice.DoesNotExist:
                pass

        answer.save()

    attempt.submitted_at = timezone.now()
    attempt.score = total_score
    attempt.status = "GRADED"
    attempt.save()

    total_points = attempt.quiz.total_points or 0
    percentage = (total_score / total_points * 100) if total_points > 0 else 0

    return Response(
        {
            "message": "Quiz submitted successfully",
            "score": total_score,
            "total_points": total_points,
            "percentage": percentage,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_quiz_attempts(request):
    if not hasattr(request.user, "student_profile"):
        return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    attempts = QuizAttempt.objects.filter(student=request.user.student_profile).order_by("-started_at")
    serializer = QuizAttemptSerializer(attempts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# GRADE FORECASTING / ANALYTICS
# ============================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def grade_forecast(request, student_id=None, subjectoffering_id=None):
    """
    GET:
      - /student/grade-forecast/                    -> list all forecasts for current student
      - /student/grade-forecast/<subjectoffering_id>/ -> get forecast for a subject offering
    POST:
      - /student/grade-forecast/ (body must include subjectoffering_id)
    """
    if student_id is None:
        if hasattr(request.user, "student_profile"):
            student_id = request.user.student_profile.id
        else:
            return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        if subjectoffering_id:
            try:
                forecast = GradeForecast.objects.get(
                    student_id=student_id,
                    SubjectOffering_id=subjectoffering_id,
                )
            except GradeForecast.DoesNotExist:
                return Response(
                    {"error": "No forecast found. Generate one by making a POST request."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = GradeForecastSerializer(forecast)
            return Response(serializer.data, status=status.HTTP_200_OK)

        forecasts = GradeForecast.objects.filter(student_id=student_id)
        serializer = GradeForecastSerializer(forecasts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST
    if not subjectoffering_id:
        subjectoffering_id = request.data.get("subjectoffering_id")

    if not subjectoffering_id:
        return Response(
            {"error": "subjectoffering_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    analytics = GradeAnalyticsService()
    forecast = analytics.generate_forecast(student_id, subjectoffering_id)

    if forecast:
        serializer = GradeForecastSerializer(forecast)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(
        {"error": "Insufficient data. Need at least 1 completed quiz."},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_topic_performance(request, student_id=None, subjectoffering_id=None):
    if student_id is None:
        if hasattr(request.user, "student_profile"):
            student_id = request.user.student_profile.id
        else:
            return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    topics_query = QuizTopicPerformance.objects.filter(student_id=student_id)
    if subjectoffering_id:
        topics_query = topics_query.filter(SubjectOffering_id=subjectoffering_id)

    topics = topics_query.order_by("-accuracy_percentage")
    serializer = QuizTopicPerformanceSerializer(topics, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_grade_analytics(request):
    if not hasattr(request.user, "student_profile"):
        return Response({"error": "Not a student"}, status=status.HTTP_403_FORBIDDEN)

    student = request.user.student_profile
    subjectoffering_id = request.query_params.get("subjectoffering_id")

    analytics = GradeAnalyticsService()
    data = analytics.get_student_quiz_data(student.id, subjectoffering_id)

    if not data:
        return Response(
            {"message": "No quiz data available yet", "quiz_count": 0},
            status=status.HTTP_200_OK,
        )

    forecast = None
    if subjectoffering_id:
        try:
            forecast_obj = GradeForecast.objects.get(
                student=student,
                SubjectOffering_id=subjectoffering_id,
            )
            forecast = GradeForecastSerializer(forecast_obj).data
        except GradeForecast.DoesNotExist:
            pass

    return Response(
        {
            "student_name": data["student_name"],
            "quiz_count": data["quiz_count"],
            "current_average": round(data["current_average"], 2),
            "quiz_scores": data["quiz_scores"],
            "recent_trend": data["recent_trend"],
            "topic_performance": data["topic_performance"],
            "last_quiz_date": data["last_quiz_date"],
            "forecast": forecast,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# QUARTERLY GRADES
# ============================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def quarterly_grades(request):
    if request.method == "GET":
        if request.user.role == "TEACHER":
            subjectoffering_id = request.query_params.get("subjectoffering_id")
            quarter = request.query_params.get("quarter")

            grades_query = QuarterlyGrade.objects.all()

            if subjectoffering_id and subjectoffering_id != "NaN":
                try:
                    grades_query = grades_query.filter(SubjectOffering_id=int(subjectoffering_id))
                except (ValueError, TypeError):
                    pass

            if quarter:
                grades_query = grades_query.filter(quarter=quarter)

            grades = (
                grades_query.select_related("student__user", "SubjectOffering")
                .order_by("student__user__last_name")
            )

            serializer = QuarterlyGradeSerializer(grades, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if hasattr(request.user, "student_profile"):
            student = request.user.student_profile
            subjectoffering_id = request.query_params.get("subjectoffering_id")
            quarter = request.query_params.get("quarter")

            grades_query = QuarterlyGrade.objects.filter(student=student)

            if subjectoffering_id:
                grades_query = grades_query.filter(SubjectOffering_id=subjectoffering_id)

            if quarter:
                grades_query = grades_query.filter(quarter=quarter)

            grades = grades_query.select_related("SubjectOffering").order_by("quarter")
            serializer = QuarterlyGradeSerializer(grades, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    # POST
    if request.user.role != "TEACHER":
        return Response({"error": "Only teachers can create grades"}, status=status.HTTP_403_FORBIDDEN)

    serializer = QuarterlyGradeCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        grade = serializer.save()
        output_serializer = QuarterlyGradeSerializer(grade)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def quarterly_grade_detail(request, grade_id):
    try:
        grade = QuarterlyGrade.objects.get(id=grade_id)
    except QuarterlyGrade.DoesNotExist:
        return Response({"error": "Grade not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role == "TEACHER":
        pass
    elif hasattr(request.user, "student_profile") and grade.student == request.user.student_profile:
        pass
    else:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        serializer = QuarterlyGradeSerializer(grade)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "PUT":
        if request.user.role != "TEACHER":
            return Response({"error": "Only teachers can update grades"}, status=status.HTTP_403_FORBIDDEN)

        serializer = QuarterlyGradeCreateUpdateSerializer(grade, data=request.data, partial=True)
        if serializer.is_valid():
            grade = serializer.save()
            output_serializer = QuarterlyGradeSerializer(grade)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.user.role != "TEACHER":
        return Response({"error": "Only teachers can delete grades"}, status=status.HTTP_403_FORBIDDEN)

    grade.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================
# QUIZ ITEM ANALYSIS
# ============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quiz_item_analysis(request, quiz_id):
    if request.user.role != "TEACHER":
        return Response({"error": "Only teachers can access item analysis"}, status=status.HTTP_403_FORBIDDEN)

    try:
        quiz = Quiz.objects.get(id=quiz_id, teacher=request.user)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    questions = quiz.questions.all().order_by("order")
    analysis = []

    for question in questions:
        answers = (
            QuizAnswer.objects.filter(question=question, attempt__status="GRADED")
            .select_related("selected_choice")
        )

        total_attempts = answers.count()

        if total_attempts == 0:
            analysis.append(
                {
                    "question_id": question.id,
                    "question_text": question.question_text,
                    "question_type": question.question_type,
                    "points": question.points,
                    "order": question.order,
                    "total_attempts": 0,
                    "correct_count": 0,
                    "incorrect_count": 0,
                    "correct_percentage": 0,
                    "difficulty": "N/A",
                    "choice_distribution": {},
                }
            )
            continue

        correct_count = answers.filter(is_correct=True).count()
        incorrect_count = total_attempts - correct_count
        correct_percentage = (correct_count / total_attempts * 100) if total_attempts > 0 else 0

        if correct_percentage >= 75:
            difficulty = "Easy"
        elif correct_percentage >= 50:
            difficulty = "Medium"
        elif correct_percentage >= 25:
            difficulty = "Hard"
        else:
            difficulty = "Very Hard"

        choice_distribution = {}
        if question.question_type in ["MULTIPLE_CHOICE", "TRUE_FALSE"]:
            for choice in question.choices.all():
                choice_count = answers.filter(selected_choice=choice).count()
                choice_distribution[choice.choice_text] = {
                    "count": choice_count,
                    "percentage": (choice_count / total_attempts * 100) if total_attempts > 0 else 0,
                    "is_correct": choice.is_correct,
                }

        analysis.append(
            {
                "question_id": question.id,
                "question_text": question.question_text,
                "question_type": question.question_type,
                "points": question.points,
                "order": question.order,
                "total_attempts": total_attempts,
                "correct_count": correct_count,
                "incorrect_count": incorrect_count,
                "correct_percentage": round(correct_percentage, 2),
                "difficulty": difficulty,
                "choice_distribution": choice_distribution,
            }
        )

    total_questions = len(questions)
    total_student_attempts = quiz.attempts.filter(status="GRADED").count()

    return Response(
        {
            "quiz_id": quiz.id,
            "quiz_title": quiz.title,
            "total_questions": total_questions,
            "total_student_attempts": total_student_attempts,
            "questions": analysis,
        },
        status=status.HTTP_200_OK,
    )
