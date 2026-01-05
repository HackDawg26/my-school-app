from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from LMS.models import Student
from .models import User

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
                "name": name
            },
            "student": student,
        }
