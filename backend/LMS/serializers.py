from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from LMS.models import Student, Teacher, Admin, Section

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
        ]

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
    # Accept student IDs when creating a section
    school_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Section
        fields = ["id", "name", "grade_level", "adviser", "is_active", "school_ids"]

    def create(self, validated_data):
        school_ids = validated_data.pop("school_ids", [])
        section = Section.objects.create(**validated_data)

        # Assign selected students
        if school_ids:
            Student.objects.filter(id__in=school_ids).update(section=section)

        return section
    

        
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

        name = f"{user.first_name} {user.last_name}".strip() or user.email

        profile = None

        if user.role == "STUDENT":
            try:
                student = user.student_profile
                profile = {
                    "grade_level": student.grade_level
                }
            except Student.DoesNotExist:
                profile = None

        elif user.role == "TEACHER":
            try:
                teacher = user.teacher_profile
                profile = {
                    "subject": teacher.subject,
                    "section": teacher.section,
                    "advisor": teacher.advisor,
                }
            except Teacher.DoesNotExist:
                profile = None

        elif user.role == "ADMIN":
            profile = {"admin": True}

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
                "school_id": user.school_id,
                "status": user.status,
            },
            "profile": profile,
        }