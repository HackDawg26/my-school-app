import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User

print('=== Checking Existing Users ===\n')

users_to_check = ['admin@gmail.com', 'teacher@gmail.com', 'student@gmail.com']

for email in users_to_check:
    try:
        user = User.objects.get(email=email)
        print(f'✓ {email} EXISTS')
        print(f'  Role: {user.role}')
        print(f'  Name: {user.first_name} {user.last_name}')
        print(f'  Active: {user.is_active}\n')
    except User.DoesNotExist:
        print(f'✗ {email} NOT FOUND\n')

print('=== All Users in Database ===')
all_users = User.objects.all()
for user in all_users:
    print(f'{user.email} - {user.role} - {user.first_name} {user.last_name}')

print(f'\nTotal users: {all_users.count()}')
