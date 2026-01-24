import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User

# Check if user already exists
if User.objects.filter(email='teacher@gmail.com').exists():
    print('Teacher account already exists!')
else:
    # Create teacher user
    user = User.objects.create_user(
        email='teacher@gmail.com',
        password='teacher123',
        first_name='Teacher',
        last_name='User',
        department='Mathematics',
        role='TEACHER'
    )
    
    print('✅ Teacher account created successfully!')
    print('Email: teacher@gmail.com')
    print('Password: teacher123')
    print('Role: TEACHER')
