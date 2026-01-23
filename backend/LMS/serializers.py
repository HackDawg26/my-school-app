from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from LMS.models import Student, Subject, SubjectOffering, Teacher, Admin, Section
from .models import Quiz, QuizQuestion, QuizChoice, QuizAttempt, QuizAnswer, QuizTopicPerformance, GradeForecast, QuarterlyGrade

User = get_user_model()


# =========================
# USER SERIALIZER
# =========================

class StudentSerializer(serializers.ModelSerializer):
    school_id = serializers.CharField(source="user.school_id", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    section = serializers.PrimaryKeyRelatedField(
        queryset=Section.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "school_id",
            "first_name",
            "last_name",
            "email",
            "grade_level",
            "section",
        ]



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    student_profile = StudentSerializer(required=False)
    subjects = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
            "school_id",
            "status",
            "student_profile",
            "subjects",
        ]
    def get_subjects(self, obj):
        if obj.role != "TEACHER":
            return []
        return obj.subjects.values("id", "name")
    
    def validate(self, data):
        role = data.get("role") or getattr(self.instance, "role", None)
        school_id = data.get("school_id") or getattr(self.instance, "school_id", None)

        student_profile = data.get("student_profile", {})
        grade_level = student_profile.get("grade_level")

        if role not in ["STUDENT", "TEACHER", "ADMIN"]:
            raise serializers.ValidationError({"role": "Invalid role selected."})

        if role == "STUDENT" and not school_id:
            raise serializers.ValidationError(
            {"school_id": "School ID is required for students."}
        )

        if role == "STUDENT" and not grade_level and not hasattr(self.instance, "student_profile"):
            raise serializers.ValidationError(
            {"student_profile": {"grade_level": "Grade level is required for students."}}
        )

        return data


    def create(self, validated_data):
        password = validated_data.pop("password")
        student_data = validated_data.pop("student_profile", None)

        user = User.objects.create_user(
        password=password,
        **validated_data
    )

        if user.role == "STUDENT":
            Student.objects.create(
            user=user,
            grade_level=student_data["grade_level"] if student_data else None,
            section=student_data.get("section") if student_data else None
        )

        elif user.role == "TEACHER":
            Teacher.objects.create(user=user)

        elif user.role == "ADMIN":
            Admin.objects.create(user=user)

        return user


    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        student_data = validated_data.pop("student_profile", None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ✅ HASH PASSWORD
        if password:
            instance.set_password(password)
            instance.save()

        # ✅ UPDATE STUDENT PROFILE
        if student_data and instance.role == "STUDENT":
            Student.objects.update_or_create(
                user=instance,
                defaults={
                "grade_level": student_data.get("grade_level"),
                "section": student_data.get("section"),
            }
            )

        return instance

class SectionSerializer(serializers.ModelSerializer):
    adviser_name = serializers.SerializerMethodField()
    # Accept student IDs when creating a section
    school_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    student_count = serializers.IntegerField(source="students.count", read_only=True)

    class Meta:
        model = Section
        fields = ["id", "name", "grade_level", "adviser", "adviser_name", "is_active", "school_ids", "student_count"]

    def create(self, validated_data):
        school_ids = validated_data.pop("school_ids", [])
        section = Section.objects.create(**validated_data)

        # Assign selected students
        if school_ids:
            Student.objects.filter(id__in=school_ids).update(section=section)

        return section
    
    def get_adviser_name(self, obj):
        if obj.adviser:
            return f"{obj.adviser.first_name} {obj.adviser.last_name}"
        return "N/A"
    
class TeacherSerializer(serializers.ModelSerializer):
    advisory = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "advisory")

    def get_advisory(self, obj):
        section = obj.advised_sections.first()
        if not section:
            return None
        # return structured data so frontend can use section.id
        return {
            "id": section.id,
            "name": section.name,
            "grade_level": section.grade_level,
            "adviser_name": f"{obj.first_name} {obj.last_name}",
        }
    
class SubjectOfferingSerializer(serializers.ModelSerializer):
    section_id = serializers.IntegerField(write_only=True)
    name = serializers.CharField()
    grade = serializers.CharField(source='section.grade_level', read_only=True)
    students = serializers.SerializerMethodField()
    nextClass = serializers.CharField(source='schedule', read_only=True)
    average = serializers.SerializerMethodField()
    pendingTasks = serializers.SerializerMethodField()
    section = serializers.CharField(source='section.name', read_only=True)
    teacher_id = serializers.IntegerField(source="teacher.id", read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = SubjectOffering
        fields = ["id", "name", "section", "room_number", "schedule", "section_id", "grade", "students", "nextClass", "average", "pendingTasks", "teacher_id", "teacher_name"]
        read_only_fields = ["id", "section"]

    def create(self, validated_data):
        request = self.context.get("request")
        teacher = getattr(request, "user", None)
        section_id = validated_data.pop("section_id")
        section = Section.objects.get(id=section_id)
        
        offering, created = SubjectOffering.objects.get_or_create(
            section=section,
            name=validated_data["name"],
            defaults={
            "room_number": validated_data.get("room_number", "TBA"),
            "schedule": validated_data.get("schedule", "TBA"),
            "teacher": teacher,  # ✅ set teacher on create
        },
    )
        return offering
    def get_students(self, obj):
        return obj.section.students.count()
    def get_average(self, obj):
        # TODO: Implement actual average calculation
        return 88
    def get_pendingTasks(self, obj):
        # pending quizzes = all quizzes not CLOSED
        return obj.quizzes.exclude(status="CLOSED").count()
    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return ""

    def get_quiz_count(self, obj):
        # all quizzes under this subject offering
        return obj.quizzes.count()

class SubjectSerializer(serializers.ModelSerializer):
    faculty_count = serializers.IntegerField(source="teachers.count", read_only=True)
    teachers = TeacherSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ["id", "name", "faculty_count", "teachers"]

from rest_framework import serializers
from .models import SubjectOffering


class SubjectListSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")
    section = serializers.CharField(source="section.name")
    grade = serializers.SerializerMethodField()
    room = serializers.CharField(source="room_number")
    nextClass = serializers.CharField(source="schedule")
    students = serializers.SerializerMethodField()
    average = serializers.SerializerMethodField()
    pendingTasks = serializers.SerializerMethodField()

    class Meta:
        model = SubjectOffering
        fields = [
            "id",
            "subject",
            "section",
            "grade",
            "room",
            "students",
            "nextClass",
            "average",
            "pendingTasks",
        ]

    def get_grade(self, obj):
        return obj.section.get_grade_level_display().replace("Grade ", "")

    def get_students(self, obj):
        # TODO: Replace with real enrollment count
        return 35

    def get_average(self, obj):
        # TODO: Replace with real grade computation
        return 88

    def get_pendingTasks(self, obj):
        # TODO: Replace with real grading logic
        return 3

class StudentSubjectOfferingSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="name", read_only=True)
    teacher_name = serializers.SerializerMethodField()
    section_name = serializers.CharField(source="section.name", read_only=True)
    grade_level = serializers.CharField(source="section.grade_level", read_only=True)

    # computed fields
    progress = serializers.IntegerField(read_only=True)  # 0..100
    average = serializers.FloatField(read_only=True)     # 0..100
    quarters = serializers.SerializerMethodField()       # {1: 88, 2: 90, ...}
    final_grade = serializers.SerializerMethodField()

    class Meta:
        model = SubjectOffering
        fields = (
            "id",
            "subject_name",
            "teacher_name",
            "section_name",
            "grade_level",
            "progress",
            "average",
            "quarters",
            "final_grade",
        )

    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return "N/A"

    def get_quarters(self, obj):
        # expects annotation or prefetched grades in the view
        qmap = {}
        grades = getattr(obj, "_student_quarterly_grades", [])
        for g in grades:
            qmap[g.quarter] = float(g.final_grade)
        return qmap
    def get_final_grade(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        student = getattr(user, "student_profile", None)
        if not student:
            return None

        qs = QuarterlyGrade.objects.filter(student=student, SubjectOffering=obj)
        vals = list(qs.values_list("final_grade", flat=True))
        vals = [float(v) for v in vals if v is not None]
        return round(sum(vals) / len(vals), 2) if vals else None
        
# Quiz Serializers
class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'choice_text', 'is_correct', 'order']
        extra_kwargs = {
            'is_correct': {'write_only': True}  # Don't expose to students
        }


class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, required=False)
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 'choices']
    
    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = QuizQuestion.objects.create(**validated_data)
        
        for choice_data in choices_data:
            QuizChoice.objects.create(question=question, **choice_data)
        
        return question


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='SubjectOffering.name', read_only=True)
    is_open = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    is_closed = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'quiz_id', 'SubjectOffering', 'subject_name', 'teacher', 'teacher_name',
            'title', 'description', 'posted_at', 'open_time', 'close_time',
            'time_limit', 'total_points', 'passing_score', 'status',
            'show_correct_answers', 'shuffle_questions', 'allow_multiple_attempts',
            'questions', 'question_count', 'is_open', 'is_upcoming', 'is_closed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['quiz_id', 'posted_at', 'teacher', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()
    
    def get_teacher_name(self, obj):
        """Get teacher's full name"""
        name = f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return name if name else obj.teacher.email
    
    def get_is_open(self, obj):
        return obj.is_open()
    
    def get_is_upcoming(self, obj):
        return obj.is_upcoming()
    
    def get_is_closed(self, obj):
        return obj.is_closed()


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            'SubjectOffering', 'title', 'description', 'open_time', 'close_time',
            'time_limit', 'total_points', 'passing_score', 'status',
            'show_correct_answers', 'shuffle_questions', 'allow_multiple_attempts'
        ]


class StudentQuizSerializer(serializers.ModelSerializer):
    """Quiz serializer for students - hides sensitive info"""
    subject_name = serializers.CharField(source='SubjectOffering.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    is_open = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    is_closed = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()
    user_attempts = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'quiz_id', 'SubjectOffering', 'subject_name', 'teacher_name', 'title',
            'description', 'open_time', 'close_time', 'time_limit',
            'total_points', 'allow_multiple_attempts', 'question_count',
            'is_open', 'is_upcoming', 'is_closed', 'user_attempts'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()
    
    def get_teacher_name(self, obj):
        """Get teacher's full name"""
        name = f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return name if name else obj.teacher.email
    
    def get_user_attempts(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            return obj.attempts.filter(student=request.user.student_profile).count()
        return 0
    
    def get_is_open(self, obj):
        return obj.is_open()
    
    def get_is_upcoming(self, obj):
        return obj.is_upcoming()
    
    def get_is_closed(self, obj):
        return obj.is_closed()


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['question', 'selected_choice', 'text_answer']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'student', 'student_name',
            'started_at', 'submitted_at', 'score', 'status', 'answers'
        ]
        read_only_fields = ['student', 'started_at', 'score']
    
    def get_student_name(self, obj):
        """Get student's full name"""
        user = obj.student.user
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.email


class QuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )


# Grade Forecasting Serializers
class QuizTopicPerformanceSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic', read_only=True)
    
    class Meta:
        model = QuizTopicPerformance
        fields = [
            'id', 'topic', 'topic_name', 'total_questions', 
            'correct_answers', 'accuracy_percentage', 'last_updated'
        ]


class GradeForecastSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='SubjectOffering.name', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    
    class Meta:
        model = GradeForecast
        fields = [
            'id', 'student', 'student_id', 'student_name', 
            'SubjectOffering', 'subject_name',
            'current_average', 'quiz_count',
            'predicted_grade', 'confidence_score',
            'risk_level', 'performance_trend',
            'strong_topics', 'weak_topics', 'recommendations',
            'generated_at', 'updated_at'
        ]
        read_only_fields = ['generated_at', 'updated_at']
    
    def get_student_name(self, obj):
        """Get student's full name"""
        user = obj.student.user
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.email

# ==================== QUARTERLY GRADES SERIALIZERS ====================

class QuarterlyGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    subject_name = serializers.CharField(source='SubjectOffering.name', read_only=True)
    
    class Meta:
        model = QuarterlyGrade
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'SubjectOffering', 'subject_name', 'quarter',
            'written_work_score', 'written_work_total',
            'performance_task_score', 'performance_task_total',
            'quarterly_assessment_score', 'quarterly_assessment_total',
            'ww_weight', 'pt_weight', 'qa_weight',
            'final_grade', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['final_grade', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        """Get student's full name"""
        user = obj.student.user
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.email


class QuarterlyGradeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating quarterly grades"""
    class Meta:
        model = QuarterlyGrade
        fields = [
            'student', 'SubjectOffering', 'quarter',
            'written_work_score', 'written_work_total',
            'performance_task_score', 'performance_task_total',
            'quarterly_assessment_score', 'quarterly_assessment_total',
            'ww_weight', 'pt_weight', 'qa_weight', 'remarks'
        ]
    
    def validate(self, data):
        """Validate that weights sum to 1.0"""
        ww = data.get('ww_weight', 0.40)
        pt = data.get('pt_weight', 0.40)
        qa = data.get('qa_weight', 0.20)
        
        total_weight = ww + pt + qa
        if abs(total_weight - 1.0) > 0.01:  # Allow small floating point errors
            raise serializers.ValidationError(
                f"Weights must sum to 1.0 (100%). Current sum: {total_weight}"
            )
        
        return data
# =========================
# LOGIN SERIALIZER
# =========================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if user.status != "ACTIVE":
            raise serializers.ValidationError("User account is inactive")

        refresh = RefreshToken.for_user(user)

        # ✅ FIX: define name properly
        full_name = f"{user.first_name} {user.last_name}".strip()

        profile = None

        if user.role == "STUDENT":
            student = getattr(user, "student_profile", None)
            profile = {
                "grade_level": student.grade_level if student else None,
                "section": student.section_id if student else None,
            }

        elif user.role == "TEACHER":
            profile = {
                "subjects": list(user.subjects.values("id", "name")),
                "advisory_sections": list(user.advised_sections.values("id", "name")),
            }

        elif user.role == "ADMIN":
            profile = {"admin": True}

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,           # ✅ REQUIRED by frontend
                "first_name": user.first_name,
                "last_name": user.last_name,
                "name": full_name,           # ✅ now valid
                "school_id": user.school_id,
                "status": user.status,
            },
            "profile": profile,
        }
# =========================

# Quiz Serializers
class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'choice_text', 'is_correct', 'order']
        extra_kwargs = {
            'is_correct': {'write_only': True}  # Don't expose to students
        }


class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, required=False)
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 'choices']
    
    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = QuizQuestion.objects.create(**validated_data)
        
        for choice_data in choices_data:
            QuizChoice.objects.create(question=question, **choice_data)
        
        return question


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    is_open = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    is_closed = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'quiz_id', 'subject', 'subject_name', 'teacher', 'teacher_name',
            'title', 'description', 'posted_at', 'open_time', 'close_time',
            'time_limit', 'total_points', 'passing_score', 'status',
            'show_correct_answers', 'shuffle_questions', 'allow_multiple_attempts',
            'questions', 'question_count', 'is_open', 'is_upcoming', 'is_closed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['quiz_id', 'posted_at', 'teacher', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()
    
    def get_teacher_name(self, obj):
        """Get teacher's full name"""
        name = f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return name if name else obj.teacher.email
    
    def get_is_open(self, obj):
        return obj.is_open()
    
    def get_is_upcoming(self, obj):
        return obj.is_upcoming()
    
    def get_is_closed(self, obj):
        return obj.is_closed()


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            'subject', 'title', 'description', 'open_time', 'close_time',
            'time_limit', 'total_points', 'passing_score', 'status',
            'show_correct_answers', 'shuffle_questions', 'allow_multiple_attempts'
        ]


class StudentQuizSerializer(serializers.ModelSerializer):
    """Quiz serializer for students - hides sensitive info"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    is_open = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    is_closed = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()
    user_attempts = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'quiz_id', 'subject', 'subject_name', 'teacher_name', 'title',
            'description', 'open_time', 'close_time', 'time_limit',
            'total_points', 'allow_multiple_attempts', 'question_count',
            'is_open', 'is_upcoming', 'is_closed', 'user_attempts'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()
    
    def get_teacher_name(self, obj):
        """Get teacher's full name"""
        name = f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return name if name else obj.teacher.email
    
    def get_user_attempts(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            return obj.attempts.filter(student=request.user.student_profile).count()
        return 0
    
    def get_is_open(self, obj):
        return obj.is_open()
    
    def get_is_upcoming(self, obj):
        return obj.is_upcoming()
    
    def get_is_closed(self, obj):
        return obj.is_closed()


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['question', 'selected_choice', 'text_answer']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'student', 'student_name',
            'started_at', 'submitted_at', 'score', 'status', 'answers'
        ]
        read_only_fields = ['student', 'started_at', 'score']
    
    def get_student_name(self, obj):
        """Get student's full name"""
        user = obj.student.user
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.email


class QuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )


# Grade Forecasting Serializers
class QuizTopicPerformanceSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic', read_only=True)
    
    class Meta:
        model = QuizTopicPerformance
        fields = [
            'id', 'topic', 'topic_name', 'total_questions', 
            'correct_answers', 'accuracy_percentage', 'last_updated'
        ]


class GradeForecastSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    
    class Meta:
        model = GradeForecast
        fields = [
            'id', 'student', 'student_id', 'student_name', 
            'subject', 'subject_name',
            'current_average', 'quiz_count',
            'predicted_grade', 'confidence_score',
            'risk_level', 'performance_trend',
            'strong_topics', 'weak_topics', 'recommendations',
            'generated_at', 'updated_at'
        ]
        read_only_fields = ['generated_at', 'updated_at']
    
    def get_student_name(self, obj):
        """Get student's full name"""
        user = obj.student.user
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.email

# ==================== QUARTERLY GRADES SERIALIZERS ====================

class QuarterlyGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = QuarterlyGrade
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'subject', 'subject_name', 'quarter',
            'written_work_score', 'written_work_total',
            'performance_task_score', 'performance_task_total',
            'quarterly_assessment_score', 'quarterly_assessment_total',
            'ww_weight', 'pt_weight', 'qa_weight',
            'final_grade', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['final_grade', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        """Get student's full name"""
        user = obj.student.user
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.email


class QuarterlyGradeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating quarterly grades"""
    class Meta:
        model = QuarterlyGrade
        fields = [
            'student', 'subject', 'quarter',
            'written_work_score', 'written_work_total',
            'performance_task_score', 'performance_task_total',
            'quarterly_assessment_score', 'quarterly_assessment_total',
            'ww_weight', 'pt_weight', 'qa_weight', 'remarks'
        ]
    
    def validate(self, data):
        """Validate that weights sum to 1.0"""
        ww = data.get('ww_weight', 0.40)
        pt = data.get('pt_weight', 0.40)
        qa = data.get('qa_weight', 0.20)
        
        total_weight = ww + pt + qa
        if abs(total_weight - 1.0) > 0.01:  # Allow small floating point errors
            raise serializers.ValidationError(
                f"Weights must sum to 1.0 (100%). Current sum: {total_weight}"
            )
        
        return data
# =========================
