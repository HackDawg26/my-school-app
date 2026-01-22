import os
import sys
import django
import random
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Quiz, QuizAttempt, QuizAnswer, Student, Subject
from django.utils import timezone

print('=== Populating Quiz Attempts and Answers ===\n')

# Get all students
students = Student.objects.all()
if not students.exists():
    print('❌ No students found! Please create students first.')
    sys.exit(1)

# Get all quizzes
quizzes = Quiz.objects.all()
if not quizzes.exists():
    print('❌ No quizzes found! Please create quizzes first.')
    sys.exit(1)

created_attempts = 0
created_answers = 0

# Generate attempts for each student on each quiz
for quiz in quizzes:
    print(f"\n📝 Creating attempts for quiz: {quiz.title}")
    
    # Parse questions from JSON
    try:
        questions = json.loads(quiz.questions)
    except (json.JSONDecodeError, TypeError):
        print(f"  ⚠️  Skipping - invalid questions format")
        continue
    
    if not questions:
        print(f"  ⚠️  Skipping - no questions found")
        continue
    
    # Have 70-90% of students attempt each quiz
    num_students_to_attempt = int(len(students) * random.uniform(0.7, 0.9))
    selected_students = random.sample(list(students), num_students_to_attempt)
    
    for student in selected_students:
        # Check if attempt already exists
        existing_attempt = QuizAttempt.objects.filter(
            quiz=quiz,
            student=student
        ).first()
        
        if existing_attempt:
            print(f"  ⚠️  {student.user.first_name} already attempted this quiz - skipping")
            continue
        
        # Create quiz attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=student,
            score=0,  # Will be calculated
            total_questions=len(questions),
            status='completed',
            started_at=timezone.now(),
            submitted_at=timezone.now()
        )
        created_attempts += 1
        
        correct_answers = 0
        
        # Create answers for each question
        for idx, question in enumerate(questions):
            question_number = idx + 1
            question_type = question.get('type', 'multiple_choice')
            correct_answer = question.get('correctAnswer', '')
            
            # Simulate student performance (70-95% chance of correct answer)
            is_correct = random.random() < random.uniform(0.7, 0.95)
            
            if is_correct:
                selected_answer = correct_answer
                correct_answers += 1
            else:
                # Select a wrong answer
                if question_type == 'multiple_choice':
                    choices = question.get('choices', [])
                    wrong_choices = [c for c in choices if c != correct_answer]
                    selected_answer = random.choice(wrong_choices) if wrong_choices else correct_answer
                elif question_type == 'true_false':
                    selected_answer = 'False' if correct_answer == 'True' else 'True'
                else:
                    selected_answer = 'Wrong answer'
            
            # Create quiz answer
            QuizAnswer.objects.create(
                attempt=attempt,
                question_number=question_number,
                selected_answer=selected_answer,
                is_correct=is_correct
            )
            created_answers += 1
        
        # Update attempt score
        attempt.score = correct_answers
        attempt.save()
        
        print(f"  ✓ {student.user.first_name} {student.user.last_name}: {correct_answers}/{len(questions)} correct")

print(f"\n{'='*50}")
print(f"✅ Quiz data population complete!")
print(f"   Created: {created_attempts} attempts")
print(f"   Created: {created_answers} answers")
print(f"{'='*50}\n")

# Show statistics
print("📊 Quiz Statistics:")
for quiz in quizzes:
    attempt_count = QuizAttempt.objects.filter(quiz=quiz).count()
    if attempt_count > 0:
        avg_score = QuizAttempt.objects.filter(quiz=quiz).aggregate(
            avg=django.db.models.Avg('score')
        )['avg']
        print(f"\n  Quiz: {quiz.title}")
        print(f"  Attempts: {attempt_count}")
        print(f"  Average Score: {avg_score:.1f}/{quiz.total_points if hasattr(quiz, 'total_points') else 'N/A'}")
