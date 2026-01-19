import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Subject

print('=== Removing Duplicate Mathematics ===')

# Find and delete the old Mathematics (ID: 1) without subject_id
try:
    old_math = Subject.objects.get(id=1)
    print(f'Found: ID: {old_math.id} - {old_math.name} - subject_id: "{old_math.subject_id}"')
    
    if old_math.subject_id == '' or not old_math.subject_id:
        old_math.delete()
        print('✓ Deleted duplicate Mathematics (ID: 1)')
    else:
        print('This subject has a valid subject_id, not deleting')
except Subject.DoesNotExist:
    print('Subject ID: 1 not found')

print('\n=== Current Subjects ===')
for subject in Subject.objects.all().order_by('id'):
    print(f'ID: {subject.id} - {subject.name} ({subject.subject_id})')
