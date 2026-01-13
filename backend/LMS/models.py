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
    student_id = models.CharField(max_length=50, unique=True)  # school ID
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "student_id", "role"]

    def __str__(self):
        return f"{self.student_id} - {self.email} ({self.role})"


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

    def __str__(self):
        return f"Student: {self.user.student_id} ({self.grade_level})"


# =========================
# TEACHER PROFILE
# =========================
class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_profile")
    subject = models.CharField(max_length=100)
    section = models.CharField(max_length=50)
    advisor = models.BooleanField(default=False)

    def __str__(self):
        return f"Teacher: {self.user.student_id}"


# =========================
# ADMIN PROFILE
# =========================
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")

    def __str__(self):
        return f"Admin: {self.user.student_id}"
