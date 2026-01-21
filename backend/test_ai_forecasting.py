"""
Quick test script to verify AI Grade Forecasting works
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from LMS.ai_service import AIService
from LMS.grade_analytics import GradeAnalyticsService

print("=" * 60)
print("TESTING AI GRADE FORECASTING")
print("=" * 60)

# Test 1: AI Service Direct Test
print("\n[TEST 1] Testing AI Service directly...")
print("-" * 60)

test_student_data = {
    'student_name': 'Test Student',
    'subject_name': 'Mathematics',
    'quiz_count': 5,
    'current_average': 78.4,
    'quiz_scores': [70, 75, 80, 82, 85],
    'recent_trend': 'Improving (recent avg 82.3% vs earlier 72.5%)',
    'topic_performance': [
        {'topic': 'Algebra', 'accuracy': 90.0, 'correct': 9, 'total': 10},
        {'topic': 'Geometry', 'accuracy': 85.0, 'correct': 17, 'total': 20},
        {'topic': 'Calculus', 'accuracy': 55.0, 'correct': 11, 'total': 20}
    ]
}

ai_service = AIService()
print("Sending test data to AI...")

try:
    result = ai_service.predict_grade(test_student_data)
    
    print("\n✅ AI SERVICE WORKING!")
    print("-" * 60)
    print(f"📊 Predicted Grade: {result['predicted_grade']}%")
    print(f"💯 Confidence Score: {result['confidence']*100:.1f}%")
    print(f"⚠️  Risk Level: {result['risk_level']}")
    print(f"📈 Performance Trend: {result['trend']}")
    print(f"\n💪 Strong Topics: {', '.join(result['strong_topics']) if result['strong_topics'] else 'None yet'}")
    print(f"📚 Weak Topics: {', '.join(result['weak_topics']) if result['weak_topics'] else 'None'}")
    print(f"\n🎯 Recommendations:")
    print(f"   {result['recommendations']}")
    
    print("\n" + "=" * 60)
    print("✅ SUCCESS! AI Grade Forecasting is working correctly!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("AI service may not be configured properly.")
    print("Check your OPENAI_API_KEY in settings.py")

# Test 2: Check if models are created
print("\n[TEST 2] Checking database models...")
print("-" * 60)

from LMS.models import GradeForecast, QuizTopicPerformance, Student, Subject

print(f"GradeForecast model: {'✅ Ready' if GradeForecast else '❌ Missing'}")
print(f"QuizTopicPerformance model: {'✅ Ready' if QuizTopicPerformance else '❌ Missing'}")

forecasts_count = GradeForecast.objects.count()
topics_count = QuizTopicPerformance.objects.count()

print(f"\nCurrent database records:")
print(f"  - Grade Forecasts: {forecasts_count}")
print(f"  - Topic Performance: {topics_count}")

# Test 3: Test with real student data if available
print("\n[TEST 3] Testing with real student data (if available)...")
print("-" * 60)

students_with_quizzes = Student.objects.filter(quiz_attempts__isnull=False).distinct()

if students_with_quizzes.exists():
    test_student = students_with_quizzes.first()
    subjects_with_quizzes = Subject.objects.filter(
        quizzes__attempts__student=test_student,
        quizzes__attempts__status='GRADED'
    ).distinct()
    
    if subjects_with_quizzes.exists():
        test_subject = subjects_with_quizzes.first()
        
        student_name = f"{test_student.user.first_name} {test_student.user.last_name}".strip() or test_student.user.email
        print(f"Found student: {student_name}")
        print(f"Testing with subject: {test_subject.name}")
        
        analytics = GradeAnalyticsService()
        
        try:
            print("\nGenerating forecast...")
            forecast = analytics.generate_forecast(test_student.id, test_subject.id)
            
            if forecast:
                print(f"\n✅ FORECAST GENERATED!")
                print(f"  Predicted Grade: {forecast.predicted_grade}%")
                print(f"  Risk Level: {forecast.risk_level}")
                print(f"  Trend: {forecast.performance_trend}")
                print(f"  Based on {forecast.quiz_count} quizzes")
            else:
                print("⚠️  Not enough data (need at least 1 graded quiz)")
        except Exception as e:
            print(f"❌ Error generating forecast: {str(e)}")
    else:
        print("⚠️  No graded quizzes found for this student")
else:
    print("⚠️  No students with quiz attempts found")
    print("   Create some quiz attempts first, then run this test again")

print("\n" + "=" * 60)
print("TEST COMPLETE!")
print("=" * 60)
