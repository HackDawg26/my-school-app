import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User

print('=== Creating Admin Account ===')

email = 'admin@gmail.com'
password = 'admin123'

# Check if user already exists
if User.objects.filter(email=email).exists():
    print(f'User {email} already exists!')
    user = User.objects.get(email=email)
else:
    # Create admin user
    user = User.objects.create_user(
        email=email,
        password=password,
        role='ADMIN',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    )
    print(f'✓ Admin account created successfully!')

print(f'\nEmail: {email}')
print(f'Password: {password}')
print(f'Role: {user.role}')
print(f'Name: {user.first_name} {user.last_name}')
