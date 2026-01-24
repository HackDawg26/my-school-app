from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


# =========================
# Custom User Manager
# =========================
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email address is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "ADMIN")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("status", "ACTIVE")

        return self.create_user(email, password, **extra_fields)


# =========================
# User Model
# =========================
class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("TEACHER", "Teacher"),
        ("STUDENT", "Student"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    ]

    email = models.EmailField(unique=True)
    school_id = models.CharField(max_length=50, unique=True)  # school ID
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "school_id", "role"]

    def __str__(self):
        return f"{self.school_id} - {self.email} ({self.role})"

class Section(models.Model):

    GRADE_LEVEL_CHOICES = [
        ("GRADE_7", "Grade 7"),
        ("GRADE_8", "Grade 8"),
        ("GRADE_9", "Grade 9"),
        ("GRADE_10", "Grade 10"),
    ]

    name = models.CharField(max_length=50)  # Section A, B, C
    grade_level = models.CharField(
        max_length=20,
        choices=GRADE_LEVEL_CHOICES
    )

    adviser = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="advised_sections",
        limit_choices_to={"role": "TEACHER"},
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("name", "grade_level")
        ordering = ["grade_level", "name"]

    def __str__(self):
        return f"{self.get_grade_level_display()} - {self.name}"
    
class Subject(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    teachers = models.ManyToManyField(
        User,
        blank=True,
        limit_choices_to={"role": "TEACHER"},
        related_name="subjects"
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

class SubjectOffering(models.Model):
    name = models.CharField(max_length=100)
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="offerings"
    )
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "TEACHER"}
    )
    room_number = models.CharField(max_length=50)
    schedule = models.CharField(max_length=100)

    class Meta:
        unique_together = ("name", "section")
        
    def __str__(self):
        return f"{self.name} — {self.section.name}"

# =========================
# STUDENT PROFILE
# =========================
class Student(models.Model):

    GRADE_LEVEL_CHOICES = [
        ("GRADE_7", "Grade 7"),
        ("GRADE_8", "Grade 8"),
        ("GRADE_9", "Grade 9"),
        ("GRADE_10", "Grade 10"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    grade_level=models.CharField(
        max_length=20,
        choices=GRADE_LEVEL_CHOICES
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students"
    )

    def __str__(self):
        return f"Student: {self.user.school_id} ({self.grade_level})"


# =========================
# TEACHER PROFILE
# =========================
class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_profile")
    department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Teacher: {self.user.school_id}"


# =========================
# ADMIN PROFILE
# =========================
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")

    def __str__(self):
        return f"Admin: {self.user.school_id}"
    
# ==================== QUARTERLY GRADES SYSTEM ====================

class QuarterlyGrade(models.Model):
    """Stores student grades per quarter with weighted components"""
    QUARTER_CHOICES = [
        ('Q1', 'First Quarter'),
        ('Q2', 'Second Quarter'),
        ('Q3', 'Third Quarter'),
        ('Q4', 'Fourth Quarter'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="quarterly_grades")
    SubjectOffering = models.ForeignKey(SubjectOffering, on_delete=models.CASCADE, related_name="quarterly_grades")
    quarter = models.CharField(max_length=2, choices=QUARTER_CHOICES)
    
    # Component scores (raw scores, not weighted)
    written_work_score = models.FloatField(default=0.0, help_text="Total WW score")
    written_work_total = models.FloatField(default=100.0, help_text="Total possible WW points")
    
    performance_task_score = models.FloatField(default=0.0, help_text="Total PT score")
    performance_task_total = models.FloatField(default=100.0, help_text="Total possible PT points")
    
    quarterly_assessment_score = models.FloatField(default=0.0, help_text="Quarterly exam score")
    quarterly_assessment_total = models.FloatField(default=100.0, help_text="Total possible QA points")
    
    # Weights (default: 40-40-20)
    ww_weight = models.FloatField(default=0.40, help_text="Written Work weight (0-1)")
    pt_weight = models.FloatField(default=0.40, help_text="Performance Task weight (0-1)")
    qa_weight = models.FloatField(default=0.20, help_text="Quarterly Assessment weight (0-1)")
    
    # Calculated final grade
    final_grade = models.FloatField(default=0.0, help_text="Weighted final grade (0-100)")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    remarks = models.TextField(blank=True, help_text="Teacher comments/remarks")
    
    class Meta:
        unique_together = ['student', 'SubjectOffering', 'quarter']
        ordering = ['student', 'SubjectOffering', 'quarter']
    
    def calculate_final_grade(self):
        """Calculate weighted final grade from component scores"""
        # Convert to percentages
        ww_pct = (self.written_work_score / self.written_work_total * 100) if self.written_work_total > 0 else 0
        pt_pct = (self.performance_task_score / self.performance_task_total * 100) if self.performance_task_total > 0 else 0
        qa_pct = (self.quarterly_assessment_score / self.quarterly_assessment_total * 100) if self.quarterly_assessment_total > 0 else 0
        
        # Apply weights
        self.final_grade = (ww_pct * self.ww_weight) + (pt_pct * self.pt_weight) + (qa_pct * self.qa_weight)
        return self.final_grade
    
    def save(self, *args, **kwargs):
        """Auto-calculate final grade before saving"""
        self.calculate_final_grade()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.user.email} - {self.SubjectOffering.name} - {self.quarter}: {self.final_grade:.2f}%"
    
class Quiz(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SCHEDULED', 'Scheduled'),
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    ]
    
    quiz_id = models.CharField(max_length=50, unique=True, blank=True)
    quarter = models.CharField(max_length=2, choices=QuarterlyGrade.QUARTER_CHOICES, default='Q1')
    SubjectOffering = models.ForeignKey(SubjectOffering, on_delete=models.CASCADE, related_name="quizzes")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_quizzes", null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Time management
    posted_at = models.DateTimeField(auto_now_add=True, null=True)
    open_time = models.DateTimeField()
    close_time = models.DateTimeField()
    time_limit = models.IntegerField(help_text="Minutes to complete quiz")
    
    # Quiz settings
    total_points = models.FloatField(default=0)
    passing_score = models.FloatField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Additional settings
    show_correct_answers = models.BooleanField(default=False)
    shuffle_questions = models.BooleanField(default=False)
    allow_multiple_attempts = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.quiz_id:
            import uuid
            self.quiz_id = f"QZ{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def is_open(self):
        from django.utils import timezone
        now = timezone.now()
        return self.open_time <= now <= self.close_time
    
    def is_upcoming(self):
        from django.utils import timezone
        return timezone.now() < self.open_time
    
    def is_closed(self):
        from django.utils import timezone
        return timezone.now() > self.close_time


class QuizQuestion(models.Model):
    QUESTION_TYPES = [
        ('MULTIPLE_CHOICE', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
        ('SHORT_ANSWER', 'Short Answer'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='MULTIPLE_CHOICE')
    points = models.FloatField(default=1)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}"


class QuizChoice(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name="choices")
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.choice_text


class QuizAttempt(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('SUBMITTED', 'Submitted'),
        ('GRADED', 'Graded'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="quiz_attempts")
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    
    def __str__(self):
        return f"{self.student.user.email} - {self.quiz.title}"


class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(QuizChoice, on_delete=models.CASCADE, null=True, blank=True)
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    points_earned = models.FloatField(default=0)
    
    def __str__(self):
        return f"{self.attempt.student.user.email} - Q{self.question.order}"


class Resource(models.Model):
    resource_id = models.CharField(max_length=50, unique=True)
    SubjectOffering = models.ForeignKey(SubjectOffering, on_delete=models.CASCADE, related_name="resources")
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    url = models.URLField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title


# ==================== GRADE FORECASTING MODELS ====================

class QuizTopicPerformance(models.Model):
    """Tracks student performance per topic across quizzes"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="topic_performance")
    SubjectOffering = models.ForeignKey(SubjectOffering, on_delete=models.CASCADE, related_name="topic_performance")
    topic = models.CharField(max_length=255, help_text="Quiz or question topic/category")
    
    # Performance metrics
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    accuracy_percentage = models.FloatField(default=0.0)
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'SubjectOffering', 'topic']
    
    def __str__(self):
        return f"{self.student.user.email} - {self.topic}: {self.accuracy_percentage}%"
    
    def update_performance(self):
        """Calculate and update accuracy percentage"""
        if self.total_questions > 0:
            self.accuracy_percentage = (self.correct_answers / self.total_questions) * 100
        else:
            self.accuracy_percentage = 0.0
        self.save()


class GradeForecast(models.Model):
    """Stores AI-generated grade predictions for students"""
    RISK_LEVELS = [
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
    ]
    
    TREND_CHOICES = [
        ('IMPROVING', 'Improving'),
        ('STABLE', 'Stable'),
        ('DECLINING', 'Declining'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grade_forecasts")
    SubjectOffering = models.ForeignKey(SubjectOffering, on_delete=models.CASCADE, related_name="grade_forecasts")
    
    # Current performance metrics
    current_average = models.FloatField(help_text="Current average quiz score")
    quiz_count = models.IntegerField(default=0, help_text="Number of quizzes taken")
    
    # AI Predictions
    predicted_grade = models.FloatField(help_text="AI predicted final grade (0-100)")
    confidence_score = models.FloatField(default=0.0, help_text="AI confidence in prediction (0-1)")
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    performance_trend = models.CharField(max_length=20, choices=TREND_CHOICES)
    
    # Analysis details
    strong_topics = models.JSONField(default=list, help_text="List of topics student excels in")
    weak_topics = models.JSONField(default=list, help_text="List of topics needing improvement")
    recommendations = models.TextField(blank=True, help_text="AI-generated study recommendations")
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-generated_at']
        unique_together = ['student', 'SubjectOffering']
    
    def __str__(self):
        return f"{self.student.user.email} - {self.SubjectOffering.name}: {self.predicted_grade}%"

class Grade(models.Model):
    grade_id = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grades")
    SubjectOffering = models.ForeignKey(SubjectOffering, on_delete=models.CASCADE, related_name="grades")
    assignment_name = models.CharField(max_length=255)
    score = models.FloatField()
    total = models.FloatField()
    date = models.DateField()

    def __str__(self):
        return f"{self.student.student_id} - {self.SubjectOffering.name} - {self.score}/{self.total}"

class GradeChangeLog(models.Model):
    CHANGE_TYPES = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
    ]

    timestamp = models.DateTimeField(auto_now_add=True)

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="grade_change_logs"
    )

    student = models.ForeignKey(
        "Student",
        on_delete=models.SET_NULL,
        null=True,
        related_name="grade_change_logs_as_student"
    )

    SubjectOffering = models.ForeignKey(
        "SubjectOffering",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    activity = models.CharField(max_length=255)  # e.g., "Quiz 1", "Essay 1"
    previous_grade = models.CharField(max_length=50, default="N/A")
    new_grade = models.CharField(max_length=50)
    change_type = models.CharField(max_length=6, choices=CHANGE_TYPES)

    def __str__(self):
        return f"{self.timestamp} {self.teacher} {self.student} {self.activity} {self.change_type}"