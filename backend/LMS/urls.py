<<<<<<< HEAD
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import current_user, LoginView

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', current_user, name="current_user")
]
=======
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    current_user, LoginView, subject_list, student_list,
    TeacherQuizViewSet, manage_quiz_question,
    student_quizzes, student_quiz_detail, start_quiz, 
    submit_quiz, student_quiz_attempts,
    grade_forecast, student_topic_performance, student_grade_analytics,
    quarterly_grades, quarterly_grade_detail, quiz_item_analysis
)

# Router for viewsets
router = DefaultRouter()
router.register(r'teacher/quizzes', TeacherQuizViewSet, basename='teacher-quiz')

urlpatterns = [
    # Authentication
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', current_user, name="current_user"),
    
    # Subjects
    path('subjects/', subject_list, name='subject_list'),
    
    # Students
    path('students/', student_list, name='student_list'),
    
    # Router URLs
    path('', include(router.urls)),
    
    # Teacher Quiz Management
    path('teacher/questions/<int:question_id>/', manage_quiz_question, name='manage_quiz_question'),
    
    # Quiz Item Analysis
    path('teacher/quizzes/<int:quiz_id>/item-analysis/', quiz_item_analysis, name='quiz_item_analysis'),
    
    # Student Quiz Access
    path('student/quizzes/', student_quizzes, name='student_quizzes'),
    path('student/quizzes/<int:quiz_id>/', student_quiz_detail, name='student_quiz_detail'),
    path('student/quizzes/<int:quiz_id>/start/', start_quiz, name='start_quiz'),
    path('student/quiz-attempts/<int:attempt_id>/submit/', submit_quiz, name='submit_quiz'),
    path('student/quiz-attempts/', student_quiz_attempts, name='student_quiz_attempts'),
    
    # Grade Forecasting - Student access
    path('student/grade-analytics/', student_grade_analytics, name='student_grade_analytics'),
    path('student/grade-forecast/', grade_forecast, name='student_grade_forecast'),
    path('student/grade-forecast/<int:subject_id>/', grade_forecast, name='student_grade_forecast_subject'),
    path('student/topic-performance/', student_topic_performance, name='student_topic_performance'),
    path('student/topic-performance/<int:subject_id>/', student_topic_performance, name='student_topic_performance_subject'),
    
    # Quarterly Grades
    path('quarterly-grades/', quarterly_grades, name='quarterly_grades'),
    path('quarterly-grades/<int:grade_id>/', quarterly_grade_detail, name='quarterly_grade_detail'),
]

# AI endpoints - Temporarily disabled (OpenAI integrated but not exposed yet)
# from .views import ai_chat, generate_quiz, explain_concept, provide_feedback, generate_study_plan
# path('ai/chat/', ai_chat, name='ai_chat'),
# path('ai/generate-quiz/', generate_quiz, name='generate_quiz'),
# path('ai/explain-concept/', explain_concept, name='explain_concept'),
# path('ai/feedback/', provide_feedback, name='provide_feedback'),
# path('ai/study-plan/', generate_study_plan, name='generate_study_plan'),
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
