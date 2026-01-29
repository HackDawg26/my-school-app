import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User

users = User.objects.filter(email__in=['teacher.quiz@school.com', 'student.quiz@school.com'])
for u in users:
    print(f"Email: {u.email}")
    print(f"  Role: {u.role}")
    print(f"  Has password: {bool(u.password)}")
    print(f"  Check 'teacher123': {u.check_password('teacher123')}")
    print(f"  Check 'student123': {u.check_password('student123')}")
    print()
