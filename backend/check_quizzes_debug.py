import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Quiz
from django.utils import timezone

print("=" * 50)
print("QUIZ DATABASE CHECK")
print("=" * 50)
print(f"Current time: {timezone.now()}")
print()

quizzes = Quiz.objects.all()
print(f"Total quizzes in database: {quizzes.count()}")
print()

for q in quizzes:
    print(f"Quiz ID: {q.id}")
    print(f"  Title: {q.title}")
    print(f"  Status: {q.status}")
    print(f"  Open Time: {q.open_time}")
    print(f"  Close Time: {q.close_time}")
    print(f"  is_open(): {q.is_open()}")
    print(f"  is_upcoming(): {q.is_upcoming()}")
    print(f"  is_closed(): {q.is_closed()}")
    print("-" * 50)

print()
print("Non-DRAFT quizzes (what students see):")
student_quizzes = Quiz.objects.exclude(status='DRAFT')
print(f"Count: {student_quizzes.count()}")
for q in student_quizzes:
    print(f"  - {q.title} (Status: {q.status})")
