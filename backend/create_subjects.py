import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Subject

print('=== Creating Subjects ===')

subjects_to_create = [
    {'subject_id': 'MATH-001', 'name': 'Mathematics', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'SCI-001', 'name': 'Science', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'ENG-001', 'name': 'English', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'HIST-001', 'name': 'History', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'FIL-001', 'name': 'Filipino', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'CS-001', 'name': 'Computer Science', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'PE-001', 'name': 'Physical Education', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'ART-001', 'name': 'Arts', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
    {'subject_id': 'MUS-001', 'name': 'Music', 'teacher': 'Teacher', 'progress': 0, 'grade': 0},
]

created_count = 0
for subject_data in subjects_to_create:
    subject, created = Subject.objects.get_or_create(
        subject_id=subject_data['subject_id'],
        defaults=subject_data
    )
    if created:
        print(f'✓ Created: {subject.name} (ID: {subject.id})')
        created_count += 1
    else:
        print(f'  Already exists: {subject.name} (ID: {subject.id})')

print(f'\n=== Summary ===')
print(f'Created: {created_count} new subjects')
print(f'Total subjects in database: {Subject.objects.count()}')

print('\n=== All Subjects ===')
for subject in Subject.objects.all().order_by('id'):
    print(f'ID: {subject.id} - {subject.name} ({subject.subject_id})')

