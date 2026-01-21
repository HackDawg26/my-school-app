from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from LMS.models import Student
<<<<<<< HEAD
from .models import User
=======
from .models import (
    User, Quiz, QuizQuestion, QuizChoice, 
    QuizAttempt, QuizAnswer, Subject,
    QuizTopicPerformance, GradeForecast, QuarterlyGrade
)
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data.get("email"), password=data.get("password"))
        if not user:
            raise serializers.ValidationError("Invalid email or password")

        refresh = RefreshToken.for_user(user)

        name = f"{user.first_name} {user.last_name}".strip()
        if not name:
            name = user.email

        # Get student profile if exists
        student = None
        if hasattr(user, "student_profile"):
            student = {
                "id": user.student_profile.student_id,
                "gpa": user.student_profile.gpa,
                "performance": user.student_profile.performance,
                "name": name
            }

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
<<<<<<< HEAD
                "name": name
            },
            "student": student,
        }
=======
                "name": name,
                "role": user.role  # Include role for frontend routing
            },
            "student": student,
        }


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
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
