import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Subject

subjects = Subject.objects.all()
print('=== Subjects in Database ===')
if subjects.exists():
    for s in subjects:
        print(f'ID: {s.id}, Name: {s.name}')
    print(f'\nTotal subjects: {subjects.count()}')
else:
    print('No subjects found in database!')
    print('\nCreating sample subjects...')
    
    sample_subjects = [
        'Mathematics',
        'Science', 
        'English',
        'History',
        'Filipino',
        'Computer Science'
    ]
    
    for name in sample_subjects:
        Subject.objects.create(name=name)
        print(f'Created: {name}')
    
    print('\nSubjects created successfully!')
    subjects = Subject.objects.all()
    for s in subjects:
        print(f'ID: {s.id}, Name: {s.name}')
