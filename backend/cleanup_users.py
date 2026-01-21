import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User, Student

print('=== Cleaning Up Users ===\n')

# Keep these 3 users
keep_emails = ['admin@gmail.com', 'teacher@gmail.com', 'student@gmail.com']

print('Users to KEEP:')
for email in keep_emails:
    try:
        user = User.objects.get(email=email)
        print(f'  ✓ {email} - {user.role}')
    except User.DoesNotExist:
        print(f'  ✗ {email} - NOT FOUND!')

# Get all other users
other_users = User.objects.exclude(email__in=keep_emails)
print(f'\nUsers to DELETE: {other_users.count()}')
for user in other_users:
    print(f'  - {user.email} ({user.role})')

if other_users.count() > 0:
    confirm = input(f'\nDelete {other_users.count()} users? (yes/no): ')
    if confirm.lower() == 'yes':
        deleted = other_users.delete()
        print(f'\n✓ Deleted {deleted[0]} users')
    else:
        print('\n✗ Cancelled')
else:
    print('\n✓ No users to delete')

print('\n=== Final User Count ===')
all_users = User.objects.all()
for user in all_users:
    print(f'{user.email} - {user.role}')
print(f'\nTotal: {all_users.count()} users')
