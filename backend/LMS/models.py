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
    student_id = models.CharField(max_length=50, unique=True)
    gpa = models.FloatField(default=0)
    performance = models.FloatField(default=0)

    def __str__(self):
        return self.user.get_full_name() or self.user.email


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


class Resource(models.Model):
    resource_id = models.CharField(max_length=50, unique=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="resources")
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    url = models.URLField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title


class Grade(models.Model):
    grade_id = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grades")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="grades")
    assignment_name = models.CharField(max_length=255)
    score = models.FloatField()
    total = models.FloatField()
    date = models.DateField()

    def __str__(self):
        return f"{self.student.student_id} - {self.subject.name} - {self.score}/{self.total}"