import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import QuarterlyGrade, Quiz, QuizAttempt
from django.db.models import Sum

print("=" * 70)
print("WRITTEN WORK RECORDING VERIFICATION")
print("=" * 70)

# Get all quarterly grades with written work
grades = QuarterlyGrade.objects.filter(written_work_total__gt=0)

print(f"\n📊 Students with Written Work Grades: {grades.count()}")

for grade in grades:
    print(f"\n{'─' * 70}")
    print(f"Student: {grade.student.user.first_name} {grade.student.user.last_name}")
    print(f"Email: {grade.student.user.email}")
    print(f"Subject: {grade.SubjectOffering.name}")
    print(f"Quarter: {grade.quarter}")
    print(f"\n📝 Written Work:")
    print(f"   Score: {grade.written_work_score}")
    print(f"   Total: {grade.written_work_total}")
    if grade.written_work_total > 0:
        percentage = (grade.written_work_score / grade.written_work_total) * 100
        print(f"   Percentage: {percentage:.2f}%")
    
    # Find which quizzes contributed
    quizzes = Quiz.objects.filter(
        SubjectOffering=grade.SubjectOffering,
        quarter=grade.quarter,
        grade_type='WRITTEN_WORK'
    )
    
    print(f"\n📝 Related Quizzes ({quizzes.count()}):")
    for quiz in quizzes:
        attempts = QuizAttempt.objects.filter(
            quiz=quiz,
            student=grade.student,
            status__in=['SUBMITTED', 'GRADED']
        )
        if attempts.exists():
            for attempt in attempts:
                print(f"   ✓ {quiz.title}")
                print(f"     Score: {attempt.score}/{quiz.total_points}")
                print(f"     Status: {attempt.status}")

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)

# Summary
print("\n📈 SUMMARY:")
total_quizzes = Quiz.objects.filter(grade_type='WRITTEN_WORK').count()
total_attempts = QuizAttempt.objects.filter(
    quiz__grade_type='WRITTEN_WORK',
    status__in=['SUBMITTED', 'GRADED']
).count()

print(f"   Total Written Work Quizzes: {total_quizzes}")
print(f"   Total Attempts (Written Work): {total_attempts}")
print(f"   Students with Recorded Grades: {grades.count()}")
print(f"\n✅ Written Work Recording is {'ACTIVE' if grades.count() > 0 else 'READY'}")
