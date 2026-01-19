import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import User, Student

print('=== Creating All Users from Grading Sheet ===\n')

# Students from the grading sheet - generating unique student IDs
students = [
    {'email': 'anna.reyes@student.com', 'first_name': 'Anna', 'last_name': 'Reyes', 'student_id': 'S-072'},
    {'email': 'ben.cruz@student.com', 'first_name': 'Ben', 'last_name': 'Cruz', 'student_id': 'S-073'},
    {'email': 'claire.lim@student.com', 'first_name': 'Claire', 'last_name': 'Lim', 'student_id': 'S-074'},
    {'email': 'diego.tan@student.com', 'first_name': 'Diego', 'last_name': 'Tan', 'student_id': 'S-075'},
    {'email': 'ela.santos@student.com', 'first_name': 'Ela', 'last_name': 'Santos', 'student_id': 'S-076'},
    {'email': 'frank.gomez@student.com', 'first_name': 'Frank', 'last_name': 'Gomez', 'student_id': 'S-077'},
    {'email': 'gina.delacruz@student.com', 'first_name': 'Gina', 'last_name': 'de la Cruz', 'student_id': 'S-078'},
    {'email': 'harold.pineda@student.com', 'first_name': 'Harold', 'last_name': 'Pineda', 'student_id': 'S-079'},
    {'email': 'isabel.mercado@student.com', 'first_name': 'Isabel', 'last_name': 'Mercado', 'student_id': 'S-080'},
    {'email': 'jose.lorenzo@student.com', 'first_name': 'Jose', 'last_name': 'Lorenzo', 'student_id': 'S-081'},
    {'email': 'karen.almonte@student.com', 'first_name': 'Karen', 'last_name': 'Almonte', 'student_id': 'S-082'},
    {'email': 'leo.garcia@student.com', 'first_name': 'Leo', 'last_name': 'Garcia', 'student_id': 'S-083'},
    {'email': 'maya.fernandez@student.com', 'first_name': 'Maya', 'last_name': 'Fernandez', 'student_id': 'S-084'},
    {'email': 'neal.ramos@student.com', 'first_name': 'Neal', 'last_name': 'Ramos', 'student_id': 'S-085'},
    {'email': 'oliva.perez@student.com', 'first_name': 'Oliva', 'last_name': 'Perez', 'student_id': 'S-086'},
    {'email': 'paolo.torres@student.com', 'first_name': 'Paolo', 'last_name': 'Torres', 'student_id': 'S-087'},
    {'email': 'quinn.vasquez@student.com', 'first_name': 'Quinn', 'last_name': 'Vasquez', 'student_id': 'S-088'},
    {'email': 'rina.delapena@student.com', 'first_name': 'Rina', 'last_name': 'Dela Pena', 'student_id': 'S-089'},
    {'email': 'sam.herrera@student.com', 'first_name': 'Sam', 'last_name': 'Herrera', 'student_id': 'S-090'},
]

# Default password for all users
default_password = 'student123'

created_count = 0
existing_count = 0

print('Creating Students...')
for student_data in students:
    email = student_data['email']
    if User.objects.filter(email=email).exists():
        print(f'  ⚠ {email} already exists')
        existing_count += 1
    else:
        # Create user (automatically creates Student due to save override)
        user = User.objects.create_user(
            email=email,
            password=default_password,
            role='STUDENT',
            first_name=student_data['first_name'],
            last_name=student_data['last_name']
        )
        # Update student_id for the auto-created Student profile
        student_profile = Student.objects.get(user=user)
        student_profile.student_id = student_data['student_id']
        student_profile.save()
        
        print(f'  ✓ Created: {student_data["first_name"]} {student_data["last_name"]} ({email}) - {student_data["student_id"]}')
        created_count += 1

print(f'\n=== Summary ===')
print(f'Created: {created_count} new students')
print(f'Already existed: {existing_count} students')
print(f'Total users in database: {User.objects.count()}')

print('\n=== All Students ===')
students = User.objects.filter(role='STUDENT').order_by('last_name')
for student in students:
    print(f'{student.first_name} {student.last_name} - {student.email}')

print(f'\n📧 All student passwords: {default_password}')
