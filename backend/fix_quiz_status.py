import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Quiz

# Find Quiz 2 and update its status
quiz = Quiz.objects.get(id=3, title='Quiz 2')
print(f"Current status: {quiz.status}")
quiz.status = 'SCHEDULED'
quiz.save()
print(f"New status: {quiz.status}")
print("Quiz 2 is now visible to students!")
