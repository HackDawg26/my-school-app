import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import Quiz, QuizQuestion, QuizChoice

print("=" * 50)
print("CHECKING QUIZ QUESTIONS AND CHOICES")
print("=" * 50)

quizzes = Quiz.objects.all()
for quiz in quizzes:
    print(f"\nQuiz: {quiz.title} (ID: {quiz.id})")
    print("-" * 50)
    
    questions = quiz.questions.all()
    print(f"Total questions: {questions.count()}")
    
    for q in questions:
        print(f"\n  Question ID: {q.id}")
        print(f"  Text: {q.question_text}")
        print(f"  Type: {q.question_type}")
        print(f"  Choices count: {q.choices.count()}")
        
        choices = q.choices.all()
        if choices.count() > 0:
            for c in choices:
                print(f"    - {c.choice_text} (Correct: {c.is_correct})")
        else:
            print(f"    ⚠️  WARNING: No choices found for this question!")
            if q.question_type in ['MULTIPLE_CHOICE', 'TRUE_FALSE']:
                print(f"    ⚠️  This is a problem - {q.question_type} questions need choices!")
