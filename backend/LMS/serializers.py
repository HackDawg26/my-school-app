from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from LMS.models import Student
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
            "student_id",
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate(self, data):
        role = data.get("role")

        if role == "STUDENT" and not data.get("student_id"):
            raise serializers.ValidationError({
                "student_id": "Student ID is required for students."
            })

        return data

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        # ✅ Create Student profile ONLY for students
        if user.role == "STUDENT":
            Student.objects.get_or_create(user=user)

        return user



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        refresh = RefreshToken.for_user(user)

        name = f"{user.first_name} {user.last_name}".strip() or user.email

        student = None
        if user.role == "STUDENT":
            try:
                student_obj = Student.objects.get(user=user)
                student = {
                    "student_id": user.student_id,  # ✅ FROM USER
                    "gpa": student_obj.gpa,
                    "performance": student_obj.performance,
                    "name": name,
                }
            except Student.DoesNotExist:
                student = None

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "name": name,
                "student_id": user.student_id,
            },
            "student": student,
        }
