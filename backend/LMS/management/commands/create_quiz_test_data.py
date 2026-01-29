from django.core.management.base import BaseCommand  # type: ignore
from django.utils import timezone  # type: ignore
from datetime import timedelta
from LMS.models import (
    User, Teacher, Student, Section, Subject, SubjectOffering,
    Quiz, QuizQuestion, QuizChoice
)
import random


class Command(BaseCommand):
    help = 'Create test data for quiz manual grading features'

    def handle(self, *args, **kwargs):
        random_suffix = str(random.randint(1000, 9999))
        
        # Create test teacher
        teacher_email = "teacher.quiz@school.com"
        teacher_password = "teacher123"
        
        teacher_user, created = User.objects.get_or_create(
            email=teacher_email,
            defaults={
                'school_id': f'TCH{random_suffix}',
                'first_name': 'Quiz',
                'last_name': 'Teacher',
                'role': 'TEACHER',
                'status': 'ACTIVE'
            }
        )
        if created:
            teacher_user.set_password(teacher_password)
            teacher_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created teacher: {teacher_email} / {teacher_password}'))
        else:
            self.stdout.write(self.style.WARNING(f'Teacher already exists: {teacher_email}'))
        
        # Get or create teacher profile
        teacher_profile, _ = Teacher.objects.get_or_create(user=teacher_user)
        
        # Create test student
        student_email = "student.quiz@school.com"
        student_password = "student123"
        
        student_user, created = User.objects.get_or_create(
            email=student_email,
            defaults={
                'school_id': f'STU{random_suffix}',
                'first_name': 'Quiz',
                'last_name': 'Student',
                'role': 'STUDENT',
                'status': 'ACTIVE'
            }
        )
        if created:
            student_user.set_password(student_password)
            student_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created student: {student_email} / {student_password}'))
        else:
            self.stdout.write(self.style.WARNING(f'Student already exists: {student_email}'))
        
        # Create section
        section, _ = Section.objects.get_or_create(
            name='Test Section',
            defaults={
                'grade_level': 'GRADE_10',
                'adviser': teacher_user
            }
        )
        
        # Get or create student profile
        student_profile, _ = Student.objects.get_or_create(
            user=student_user,
            defaults={'section': section}
        )
        
        # Make sure section is set
        if student_profile.section != section:
            student_profile.section = section
            student_profile.save()
        
        # Create subject
        subject, _ = Subject.objects.get_or_create(
            name='Test Math',
            defaults={'is_active': True}
        )
        subject.teachers.add(teacher_user)
        
        # Create subject offering
        offering, _ = SubjectOffering.objects.get_or_create(
            name='Test Math - Grade 10',
            section=section,
            defaults={
                'teacher': teacher_user,
                'room_number': '101',
                'schedule': 'MWF 9:00-10:00'
            }
        )
        
        # Create a test quiz
        now = timezone.now()
        quiz, created = Quiz.objects.get_or_create(
            title='Test Quiz for Manual Grading',
            SubjectOffering=offering,
            defaults={
                'teacher': teacher_user,
                'description': 'This quiz tests manual grading features',
                'open_time': now - timedelta(days=1),
                'close_time': now + timedelta(days=7),
                'time_limit': 30,
                'total_points': 12,
                'passing_score': 7,
                'status': 'OPEN',
                'quarter': 'Q1',
                'grade_type': 'WRITTEN_WORK',
                'show_correct_answers': False,
                'shuffle_questions': False,
                'allow_multiple_attempts': False
            }
        )
        
        if created:
            # Create quiz questions
            q1 = QuizQuestion.objects.create(
                quiz=quiz,
                question_text='What is 2 + 2?',
                question_type='MULTIPLE_CHOICE',
                points=1,
                order=1
            )
            QuizChoice.objects.create(question=q1, choice_text='3', is_correct=False)
            QuizChoice.objects.create(question=q1, choice_text='4', is_correct=True)
            QuizChoice.objects.create(question=q1, choice_text='5', is_correct=False)
            
            q2 = QuizQuestion.objects.create(
                quiz=quiz,
                question_text='What is the capital of France?',
                question_type='MULTIPLE_CHOICE',
                points=1,
                order=2
            )
            QuizChoice.objects.create(question=q2, choice_text='London', is_correct=False)
            QuizChoice.objects.create(question=q2, choice_text='Berlin', is_correct=False)
            QuizChoice.objects.create(question=q2, choice_text='Paris', is_correct=True)
            QuizChoice.objects.create(question=q2, choice_text='Madrid', is_correct=False)
            
            q3 = QuizQuestion.objects.create(
                quiz=quiz,
                question_text='Explain photosynthesis in your own words. You may upload a file.',
                question_type='SHORT_ANSWER',
                points=5,
                order=3
            )
            
            q4 = QuizQuestion.objects.create(
                quiz=quiz,
                question_text='Describe the water cycle. You may upload a file.',
                question_type='SHORT_ANSWER',
                points=5,
                order=4
            )
            
            self.stdout.write(self.style.SUCCESS(f'Created quiz: {quiz.title} (ID: {quiz.id})'))
        
        self.stdout.write(self.style.SUCCESS('\n=== Test Data Created Successfully! ==='))
        self.stdout.write(f'Teacher: {teacher_email} / {teacher_password}')
        self.stdout.write(f'Student: {student_email} / {student_password}')
        self.stdout.write(f'Quiz ID: {quiz.id}')
        self.stdout.write(f'\nYou can now test the manual grading features!')
