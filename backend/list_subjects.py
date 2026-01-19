import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Subject

print('=== Subjects in Database ===')
subjects = Subject.objects.all()
if subjects.exists():
    for s in subjects:
        print(f'ID: {s.id} - Name: {s.name}')
    print(f'\nTotal: {subjects.count()} subjects')
else:
    print('No subjects found!')
