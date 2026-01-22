import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import QuizQuestion, QuizChoice

print("=" * 50)
print("FIXING TRUE_FALSE QUESTIONS WITHOUT CHOICES")
print("=" * 50)

# Find all TRUE_FALSE questions without choices
true_false_questions = QuizQuestion.objects.filter(question_type='TRUE_FALSE')

for question in true_false_questions:
    choices_count = question.choices.count()
    
    print(f"\nQuestion ID: {question.id}")
    print(f"  Text: {question.question_text}")
    print(f"  Current choices: {choices_count}")
    
    if choices_count == 0:
        # Create True and False choices
        # Default to True being correct (teacher can change this later)
        QuizChoice.objects.create(
            question=question,
            choice_text='True',
            is_correct=True,
            order=0
        )
        QuizChoice.objects.create(
            question=question,
            choice_text='False',
            is_correct=False,
            order=1
        )
        print(f"  ✅ Created True/False choices (True is marked correct by default)")
    else:
        print(f"  ℹ️  Already has choices, skipping")

print("\n" + "=" * 50)
print("DONE! All TRUE_FALSE questions now have choices")
print("=" * 50)
