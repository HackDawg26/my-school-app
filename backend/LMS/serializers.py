from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from LMS.models import Student
from .models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        # ✅ Authenticate using email
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        # ✅ Create JWT tokens
        refresh = RefreshToken.for_user(user)

        # ✅ Safe full name
        name = f"{user.first_name} {user.last_name}".strip()
        if not name:
            name = user.email

        # ✅ Student profile (ONLY if role == STUDENT)
        student = None
        if user.role == "STUDENT":
            try:
                student_obj = Student.objects.get(user=user)
                student = {
                    "id": student_obj.student_id,
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
            },
            "student": student,
        }
