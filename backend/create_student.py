import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User

print('=== Creating Student Account ===')

email = 'student@gmail.com'
password = 'student123'

# Check if user already exists
if User.objects.filter(email=email).exists():
    print(f'User {email} already exists!')
    user = User.objects.get(email=email)
    print(f'Email: {user.email}')
    print(f'Role: {user.role}')
    print(f'Name: {user.first_name} {user.last_name}')
else:
    # Create student user
    user = User.objects.create_user(
        email=email,
        password=password,
        role='STUDENT',
        first_name='Test',
        last_name='Student'
    )
    print(f'✓ Student account created successfully!')
    print(f'Email: {email}')
    print(f'Password: {password}')
    print(f'Role: STUDENT')
    print(f'Name: Test Student')

print('\n=== Login Credentials ===')
print(f'Email: {email}')
print(f'Password: {password}')
