from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, role="STUDENT", **extra_fields):
        if not email:
            raise ValueError("Email address is required")
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMIN")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("TEACHER", "Teacher"),
        ("STUDENT", "Student"),
    ]

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STUDENT")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name","last_name","role"]

    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None  # checks if user is newly created
        super().save(*args, **kwargs)

        if is_new and self.role == "STUDENT":
            Student.objects.create(user=self)


    
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
<<<<<<< HEAD
    student_id = models.CharField(max_length=50, unique=True)
    gpa = models.FloatField(default=0)
    performance = models.FloatField(default=0)

    def __str__(self):
        return self.user.get_full_name() or self.user.email
=======
    student_id = models.CharField(max_length=50, unique=True, blank=True, default='')
    gpa = models.FloatField(default=0)
    performance = models.FloatField(default=0)

    def save(self, *args, **kwargs):
        if not self.student_id:
            # Auto-generate student_id if not provided
            # Get the highest existing student_id number
            last_student = Student.objects.filter(student_id__startswith='S-').order_by('-student_id').first()
            if last_student and last_student.student_id:
                try:
                    last_num = int(last_student.student_id.split('-')[1])
                    new_num = last_num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1
            self.student_id = f'S-{new_num:03d}'
        super().save(*args, **kwargs)

    def __str__(self):
        name = f"{self.user.first_name} {self.user.last_name}".strip()
        return name if name else self.user.email
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f


class Subject(models.Model):
    subject_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    teacher = models.CharField(max_length=150)
    progress = models.FloatField(default=0)
    grade = models.FloatField(default=0)

    def __str__(self):
        return self.name


class Assignment(models.Model):
    assignment_id = models.CharField(max_length=50, unique=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50)
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.title


class Quiz(models.Model):
<<<<<<< HEAD
    quiz_id = models.CharField(max_length=50, unique=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=255)
    due_date = models.DateTimeField()
    time_limit = models.IntegerField(help_text="Minutes")
    questions = models.IntegerField()
    status = models.CharField(max_length=50)
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.title
=======
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SCHEDULED', 'Scheduled'),
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    ]
    
    quiz_id = models.CharField(max_length=50, unique=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="quizzes")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_quizzes", null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Time management
    posted_at = models.DateTimeField(auto_now_add=True, null=True)
    open_time = models.DateTimeField()
    close_time = models.DateTimeField()
    time_limit = models.IntegerField(help_text="Minutes to complete quiz")
    
    # Quiz settings
    total_points = models.FloatField(default=100)
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
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f


class Resource(models.Model):
    resource_id = models.CharField(max_length=50, unique=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="resources")
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    url = models.URLField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title


<<<<<<< HEAD
=======
# ==================== GRADE FORECASTING MODELS ====================

class QuizTopicPerformance(models.Model):
    """Tracks student performance per topic across quizzes"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="topic_performance")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="topic_performance")
    topic = models.CharField(max_length=255, help_text="Quiz or question topic/category")
    
    # Performance metrics
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    accuracy_percentage = models.FloatField(default=0.0)
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'subject', 'topic']
    
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
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="grade_forecasts")
    
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
        unique_together = ['student', 'subject']
    
    def __str__(self):
        return f"{self.student.user.email} - {self.subject.name}: {self.predicted_grade}%"


>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
class Grade(models.Model):
    grade_id = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grades")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="grades")
    assignment_name = models.CharField(max_length=255)
    score = models.FloatField()
    total = models.FloatField()
    date = models.DateField()

    def __str__(self):
<<<<<<< HEAD
        return f"{self.student.student_id} - {self.subject.name} - {self.score}/{self.total}"
=======
        return f"{self.student.student_id} - {self.subject.name} - {self.score}/{self.total}"


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
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="quarterly_grades")
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
        unique_together = ['student', 'subject', 'quarter']
        ordering = ['student', 'subject', 'quarter']
    
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
        return f"{self.student.user.email} - {self.subject.name} - {self.quarter}: {self.final_grade:.2f}%"
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
