from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from LMS.models import Student, Subject, SubjectOffering, Teacher, Admin, Section

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
        return f"{section.get_grade_level_display()} - {section.name}" if section else "N/A"
    
class SubjectOfferingSerializer(serializers.ModelSerializer):
    section_id = serializers.IntegerField(write_only=True)
    name = serializers.CharField()
    grade = serializers.CharField(source='section.grade_level', read_only=True)
    students = serializers.SerializerMethodField()
    nextClass = serializers.CharField(source='schedule', read_only=True)
    average = serializers.SerializerMethodField()
    pendingTasks = serializers.SerializerMethodField()
    section = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = SubjectOffering
        fields = ["id", "name", "section", "room_number", "schedule", "section_id", "grade", "students", "nextClass", "average", "pendingTasks"]
        read_only_fields = ["id", "section"]

    def create(self, validated_data):
        section_id = validated_data.pop("section_id")
        section = Section.objects.get(id=section_id)
        offering, created = SubjectOffering.objects.get_or_create(
            section=section,
            name=validated_data["name"],
            defaults={
                "room_number": validated_data.get("room_number", "TBA"),
                "schedule": validated_data.get("schedule", "TBA"),
            }
        )
        return offering
    def get_students(self, obj):
        return obj.section.students.count()
    def get_average(self, obj):
        # TODO: Implement actual average calculation
        return 88
    def get_pendingTasks(self, obj):
        # TODO: Implement actual pending tasks logic
        return 3

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

        profile = None

        if user.role == "STUDENT":
            student = getattr(user, "student_profile", None)
            profile = {
                "grade_level": student.grade_level if student else None,
                "section": student.section_id if student else None,
            }

        elif user.role == "TEACHER":
            profile = {
                "subjects": user.subjects.values("id", "name"),
                "advisory_sections": user.advised_sections.values("id", "name"),
            }

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
                "school_id": user.school_id,
                "status": user.status,
            },
            "profile": profile,
        }
