from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    current_user, LoginView,
    subject_list, student_list,

    # Admin / user management (MAKE SURE THESE EXIST)
    list_users, create_user, user_detail,
    AdminDashboardStatsView,

    # Quizzes
    TeacherQuizViewSet, manage_quiz_question,
    student_quizzes, student_quiz_detail, start_quiz,
    submit_quiz, student_quiz_attempts,
    quiz_item_analysis,

    # Analytics / Forecasting
    grade_forecast, student_topic_performance, student_grade_analytics,

    # Quarterly
    quarterly_grades, quarterly_grade_detail,
)

router = DefaultRouter()
router.register(r"teacher/quizzes", TeacherQuizViewSet, basename="teacher-quiz")

urlpatterns = [
    # Auth
    path("token/", LoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/", current_user, name="current_user"),

    # Admin
    path("users/", list_users, name="list_users"),
    path("users/create/", create_user, name="create_user"),
    path("users/<int:pk>/", user_detail, name="user_detail"),
    path("dashboard/stats/", AdminDashboardStatsView.as_view(), name="admin_dashboard_stats"),

    # Subjects / Students
    path("subjects/", subject_list, name="subject_list"),
    path("students/", student_list, name="student_list"),

    # ViewSets
    path("", include(router.urls)),

    # Teacher quiz question management
    path("teacher/questions/<int:question_id>/", manage_quiz_question, name="manage_quiz_question"),
    path("teacher/quizzes/<int:quiz_id>/item-analysis/", quiz_item_analysis, name="quiz_item_analysis"),

    # Student quiz access
    path("student/quizzes/", student_quizzes, name="student_quizzes"),
    path("student/quizzes/<int:quiz_id>/", student_quiz_detail, name="student_quiz_detail"),
    path("student/quizzes/<int:quiz_id>/start/", start_quiz, name="start_quiz"),
    path("student/quiz-attempts/<int:attempt_id>/submit/", submit_quiz, name="submit_quiz"),
    path("student/quiz-attempts/", student_quiz_attempts, name="student_quiz_attempts"),

    # Student analytics / forecasting
    path("student/grade-analytics/", student_grade_analytics, name="student_grade_analytics"),
    path("student/grade-forecast/", grade_forecast, name="student_grade_forecast"),
    path("student/grade-forecast/<int:subjectoffering_id>/", grade_forecast, name="student_grade_forecast_subject"),
    path("student/topic-performance/", student_topic_performance, name="student_topic_performance"),
    path("student/topic-performance/<int:subjectoffering_id>/", student_topic_performance, name="student_topic_performance_subject"),

    # Quarterly grades
    path("quarterly-grades/", quarterly_grades, name="quarterly_grades"),
    path("quarterly-grades/<int:grade_id>/", quarterly_grade_detail, name="quarterly_grade_detail"),
]
