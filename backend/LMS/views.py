from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib import messages
from django.utils import timezone
from rest_framework import views, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    LoginSerializer, QuizSerializer, QuizCreateUpdateSerializer,
    QuizQuestionSerializer, StudentQuizSerializer, QuizAttemptSerializer,
    QuizSubmissionSerializer, QuizChoiceSerializer,
    GradeForecastSerializer, QuizTopicPerformanceSerializer,
    QuarterlyGradeSerializer, QuarterlyGradeCreateUpdateSerializer
)
from .models import (
    Quiz, QuizQuestion, QuizChoice, QuizAttempt, 
    QuizAnswer, Subject, Student, GradeForecast, QuizTopicPerformance,
    QuarterlyGrade
)
from .grade_analytics import GradeAnalyticsService
# from .ai_service import AIService  # AI integration ready but not exposed yet

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subject_list(request):
    """Get all subjects"""
    subjects = Subject.objects.all()
    return Response([{"id": s.id, "name": s.name} for s in subjects])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_list(request):
    """Get all students - for teachers to select when adding grades"""
    if request.user.role != 'TEACHER' and request.user.role != 'ADMIN':
        return Response({"error": "Only teachers and admins can access student list"}, status=403)
    
    students = Student.objects.select_related('user').all()
    return Response([{
        "id": s.id,
        "student_id": s.student_id,
        "name": f"{s.user.first_name} {s.user.last_name}",
        "email": s.user.email
    } for s in students])


class LoginView(APIView):
    def post(self, request):
        import sys
        print("=" * 50, file=sys.stderr)
        print(f"Login attempt with data: {request.data}", file=sys.stderr)
        print("=" * 50, file=sys.stderr)
        
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}", file=sys.stderr)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


# ==================== TEACHER QUIZ VIEWS ====================

class TeacherQuizViewSet(viewsets.ModelViewSet):
    """ViewSet for teachers to manage quizzes"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'TEACHER':
            return Quiz.objects.filter(teacher=self.request.user).order_by('-created_at')
        return Quiz.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return QuizCreateUpdateSerializer
        return QuizSerializer
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Override create to return full quiz data with ID"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full quiz data using QuizSerializer
        quiz = serializer.instance
        output_serializer = QuizSerializer(quiz)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def add_question(self, request, pk=None):
        """Add a question to the quiz"""
        quiz = self.get_object()
        serializer = QuizQuestionSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(quiz=quiz)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a quiz"""
        quiz = self.get_object()
        questions = quiz.questions.all().order_by('order')
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_times(self, request, pk=None):
        """Update quiz open and close times"""
        try:
            from django.utils.dateparse import parse_datetime
            from django.utils import timezone
            from datetime import datetime
            quiz = self.get_object()
            
            if 'open_time' in request.data:
                time_str = request.data['open_time']
                # Try parsing as ISO format first (e.g., "2026-01-12T08:33:00.000Z")
                try:
                    parsed_time = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
                except:
                    # Fall back to simple format (e.g., "2026-01-12T23:56")
                    if len(time_str) == 16:  # Format: YYYY-MM-DDTHH:MM
                        time_str += ':00'
                    parsed_time = parse_datetime(time_str)
                    if parsed_time and timezone.is_naive(parsed_time):
                        parsed_time = timezone.make_aware(parsed_time)
                quiz.open_time = parsed_time
                
            if 'close_time' in request.data:
                time_str = request.data['close_time']
                try:
                    parsed_time = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
                except:
                    if len(time_str) == 16:
                        time_str += ':00'
                    parsed_time = parse_datetime(time_str)
                    if parsed_time and timezone.is_naive(parsed_time):
                        parsed_time = timezone.make_aware(parsed_time)
                quiz.close_time = parsed_time
            
            quiz.save()
            serializer = self.get_serializer(quiz)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'detail': 'Failed to update quiz times'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def attempts(self, request, pk=None):
        """Get all student attempts for this quiz"""
        quiz = self.get_object()
        attempts = quiz.attempts.all().order_by('-started_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_quiz_question(request, question_id):
    """Update or delete a quiz question"""
    try:
        question = QuizQuestion.objects.get(id=question_id, quiz__teacher=request.user)
    except QuizQuestion.DoesNotExist:
        return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PUT':
        serializer = QuizQuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== STUDENT QUIZ VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_quizzes(request):
    """Get all available quizzes for a student"""
    if not hasattr(request.user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get all quizzes except DRAFT (include SCHEDULED, OPEN, and CLOSED for history)
    # Students should see all published quizzes regardless of status
    quizzes = Quiz.objects.exclude(status='DRAFT').order_by('open_time')
    serializer = StudentQuizSerializer(quizzes, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_quiz_detail(request, quiz_id):
    """Get quiz details for a student"""
    if not hasattr(request.user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = StudentQuizSerializer(quiz, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_quiz(request, quiz_id):
    """Start a quiz attempt"""
    if not hasattr(request.user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if quiz is open
    if not quiz.is_open():
        return Response({'error': 'Quiz is not currently open'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if student already has an attempt
    student = request.user.student_profile
    existing_attempt = QuizAttempt.objects.filter(
        quiz=quiz, 
        student=student, 
        status='IN_PROGRESS'
    ).first()
    
    if existing_attempt:
        # Return existing attempt with quiz and questions data
        questions = quiz.questions.all().order_by('order')
        questions_data = QuizQuestionSerializer(questions, many=True).data
        
        return Response({
            'attempt_id': existing_attempt.id,
            'quiz': StudentQuizSerializer(quiz).data,
            'questions': questions_data,
            'started_at': existing_attempt.started_at
        })
    
    # Check if multiple attempts allowed
    if not quiz.allow_multiple_attempts:
        previous_attempts = QuizAttempt.objects.filter(quiz=quiz, student=student).count()
        if previous_attempts > 0:
            return Response({'error': 'Multiple attempts not allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create new attempt
    attempt = QuizAttempt.objects.create(quiz=quiz, student=student)
    
    # Return quiz questions
    questions = quiz.questions.all().order_by('order')
    questions_data = QuizQuestionSerializer(questions, many=True).data
    
    return Response({
        'attempt_id': attempt.id,
        'quiz': StudentQuizSerializer(quiz).data,
        'questions': questions_data,
        'started_at': attempt.started_at
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, attempt_id):
    """Submit quiz answers"""
    if not hasattr(request.user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        attempt = QuizAttempt.objects.get(
            id=attempt_id, 
            student=request.user.student_profile,
            status='IN_PROGRESS'
        )
    except QuizAttempt.DoesNotExist:
        return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if quiz is still open
    if not attempt.quiz.is_open():
        return Response({'error': 'Quiz has closed'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = QuizSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Process answers
    answers_data = serializer.validated_data['answers']
    total_score = 0
    
    for answer_data in answers_data:
        question_id = answer_data.get('question_id')
        selected_choice_id = answer_data.get('selected_choice_id')
        text_answer = answer_data.get('text_answer', '')
        
        try:
            question = QuizQuestion.objects.get(id=question_id, quiz=attempt.quiz)
        except QuizQuestion.DoesNotExist:
            continue
        
        # Create answer record
        answer = QuizAnswer.objects.create(
            attempt=attempt,
            question=question,
            text_answer=text_answer
        )
        
        # Grade multiple choice and true/false questions
        if (question.question_type == 'MULTIPLE_CHOICE' or question.question_type == 'TRUE_FALSE') and selected_choice_id:
            try:
                choice = QuizChoice.objects.get(id=selected_choice_id, question=question)
                answer.selected_choice = choice
                answer.is_correct = choice.is_correct
                if choice.is_correct:
                    answer.points_earned = question.points
                    total_score += question.points
            except QuizChoice.DoesNotExist:
                pass
        
        answer.save()
    
    # Update attempt
    attempt.submitted_at = timezone.now()
    attempt.score = total_score
    attempt.status = 'GRADED'
    attempt.save()
    
    return Response({
        'message': 'Quiz submitted successfully',
        'score': total_score,
        'total_points': attempt.quiz.total_points,
        'percentage': (total_score / attempt.quiz.total_points * 100) if attempt.quiz.total_points > 0 else 0
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_quiz_attempts(request):
    """Get all quiz attempts for the current student"""
    if not hasattr(request.user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    attempts = QuizAttempt.objects.filter(
        student=request.user.student_profile
    ).order_by('-started_at')
    
    serializer = QuizAttemptSerializer(attempts, many=True)
    return Response(serializer.data)


# AI-powered endpoints (Temporarily disabled - ready for future use)
# Uncomment when ready to enable AI features

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def ai_chat(request):
#     """General AI chat endpoint"""
#     ai_service = AIService()
#     messages = request.data.get('messages', [])
#     
#     if not messages:
#         return Response({'error': 'Messages are required'}, status=status.HTTP_400_BAD_REQUEST)
#     
#     response = ai_service.chat(messages)
#     return Response({'response': response})


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def generate_quiz(request):
#     """Generate quiz questions using AI"""
#     ai_service = AIService()
#     subject = request.data.get('subject', '')
#     topic = request.data.get('topic', '')
#     num_questions = request.data.get('num_questions', 5)
#     
#     if not subject or not topic:
#         return Response({'error': 'Subject and topic are required'}, status=status.HTTP_400_BAD_REQUEST)
#     
#     questions = ai_service.generate_quiz_questions(subject, topic, num_questions)
#     return Response({'questions': questions})


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def explain_concept(request):
#     """Get AI explanation of a concept"""
#     ai_service = AIService()
#     concept = request.data.get('concept', '')
#     subject = request.data.get('subject', '')
#     
#     if not concept or not subject:
#         return Response({'error': 'Concept and subject are required'}, status=status.HTTP_400_BAD_REQUEST)
#     
#     explanation = ai_service.explain_concept(concept, subject)
#     return Response({'explanation': explanation})


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def provide_feedback(request):
#     """Get AI feedback on student answer"""
#     ai_service = AIService()
#     student_answer = request.data.get('student_answer', '')
#     correct_answer = request.data.get('correct_answer', '')
#     question = request.data.get('question', '')
#     
#     if not all([student_answer, correct_answer, question]):
#         return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
#     
#     feedback = ai_service.provide_feedback(student_answer, correct_answer, question)
#     return Response({'feedback': feedback})


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def generate_study_plan(request):
#     """Generate personalized study plan"""
#     ai_service = AIService()
#     subject = request.data.get('subject', '')
#     topics = request.data.get('topics', [])
#     difficulty_level = request.data.get('difficulty_level', 'intermediate')
#     
#     if not subject or not topics:
#         return Response({'error': 'Subject and topics are required'}, status=status.HTTP_400_BAD_REQUEST)
#     
#     study_plan = ai_service.generate_study_plan(subject, topics, difficulty_level)
#     return Response({'study_plan': study_plan})


# ==================== GRADE FORECASTING VIEWS ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def grade_forecast(request, student_id=None, subject_id=None):
    """
    Get or generate grade forecast for a student
    
    GET: Retrieve existing forecast
    POST: Generate new forecast using AI
    """
    # Determine student_id (from param or current user)
    if student_id is None:
        if hasattr(request.user, 'student_profile'):
            student_id = request.user.student_profile.id
        else:
            return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Get all forecasts for student or specific subject
        if subject_id:
            try:
                forecast = GradeForecast.objects.get(student_id=student_id, subject_id=subject_id)
                serializer = GradeForecastSerializer(forecast)
                return Response(serializer.data)
            except GradeForecast.DoesNotExist:
                return Response(
                    {'error': 'No forecast found. Generate one by making a POST request.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            forecasts = GradeForecast.objects.filter(student_id=student_id)
            serializer = GradeForecastSerializer(forecasts, many=True)
            return Response(serializer.data)
    
    elif request.method == 'POST':
        # Generate new forecast
        if not subject_id:
            subject_id = request.data.get('subject_id')
        
        if not subject_id:
            return Response(
                {'error': 'subject_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate forecast using analytics service
        analytics = GradeAnalyticsService()
        forecast = analytics.generate_forecast(student_id, subject_id)
        
        if forecast:
            serializer = GradeForecastSerializer(forecast)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': 'Insufficient data. Need at least 1 completed quiz.'},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_topic_performance(request, student_id=None, subject_id=None):
    """Get topic-level performance data for a student"""
    # Determine student_id (from param or current user)
    if student_id is None:
        if hasattr(request.user, 'student_profile'):
            student_id = request.user.student_profile.id
        else:
            return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filter by subject if provided
    topics_query = QuizTopicPerformance.objects.filter(student_id=student_id)
    if subject_id:
        topics_query = topics_query.filter(subject_id=subject_id)
    
    topics = topics_query.order_by('-accuracy_percentage')
    serializer = QuizTopicPerformanceSerializer(topics, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_grade_analytics(request):
    """Get comprehensive analytics for current student"""
    if not hasattr(request.user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    student = request.user.student_profile
    subject_id = request.query_params.get('subject_id')
    
    # Get analytics data
    analytics = GradeAnalyticsService()
    data = analytics.get_student_quiz_data(student.id, subject_id)
    
    if not data:
        return Response({
            'message': 'No quiz data available yet',
            'quiz_count': 0
        })
    
    # Get existing forecast if available
    forecast = None
    if subject_id:
        try:
            forecast_obj = GradeForecast.objects.get(student=student, subject_id=subject_id)
            forecast = GradeForecastSerializer(forecast_obj).data
        except GradeForecast.DoesNotExist:
            pass
    
    return Response({
        'student_name': data['student_name'],
        'quiz_count': data['quiz_count'],
        'current_average': round(data['current_average'], 2),
        'quiz_scores': data['quiz_scores'],
        'recent_trend': data['recent_trend'],
        'topic_performance': data['topic_performance'],
        'last_quiz_date': data['last_quiz_date'],
        'forecast': forecast
    })


# ==================== QUARTERLY GRADES VIEWS ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def quarterly_grades(request):
    """Get or create quarterly grades"""
    if request.method == 'GET':
        # Filter by teacher for teachers, or by student for students
        if request.user.role == 'TEACHER':
            subject_id = request.query_params.get('subject_id')
            quarter = request.query_params.get('quarter')
            
            grades_query = QuarterlyGrade.objects.all()
            # Only filter by subject_id if it's a valid integer
            if subject_id and subject_id != 'NaN':
                try:
                    subject_id = int(subject_id)
                    grades_query = grades_query.filter(subject_id=subject_id)
                except (ValueError, TypeError):
                    pass  # Ignore invalid subject_id
            if quarter:
                grades_query = grades_query.filter(quarter=quarter)
            
            grades = grades_query.select_related('student__user', 'subject').order_by('student__user__last_name')
            serializer = QuarterlyGradeSerializer(grades, many=True)
            return Response(serializer.data)
        
        elif hasattr(request.user, 'student_profile'):
            # Students can only see their own grades
            student = request.user.student_profile
            subject_id = request.query_params.get('subject_id')
            quarter = request.query_params.get('quarter')
            
            grades_query = QuarterlyGrade.objects.filter(student=student)
            if subject_id:
                grades_query = grades_query.filter(subject_id=subject_id)
            if quarter:
                grades_query = grades_query.filter(quarter=quarter)
            
            grades = grades_query.select_related('subject').order_by('quarter')
            serializer = QuarterlyGradeSerializer(grades, many=True)
            return Response(serializer.data)
        
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    elif request.method == 'POST':
        # Only teachers can create grades
        if request.user.role != 'TEACHER':
            return Response({'error': 'Only teachers can create grades'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = QuarterlyGradeCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            grade = serializer.save()
            output_serializer = QuarterlyGradeSerializer(grade)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def quarterly_grade_detail(request, grade_id):
    """Get, update, or delete a specific quarterly grade"""
    try:
        grade = QuarterlyGrade.objects.get(id=grade_id)
    except QuarterlyGrade.DoesNotExist:
        return Response({'error': 'Grade not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Permission check
    if request.user.role == 'TEACHER':
        pass  # Teachers can access all grades
    elif hasattr(request.user, 'student_profile') and grade.student == request.user.student_profile:
        pass  # Students can access their own grades
    else:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = QuarterlyGradeSerializer(grade)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if request.user.role != 'TEACHER':
            return Response({'error': 'Only teachers can update grades'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = QuarterlyGradeCreateUpdateSerializer(grade, data=request.data, partial=True)
        if serializer.is_valid():
            grade = serializer.save()
            output_serializer = QuarterlyGradeSerializer(grade)
            return Response(output_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if request.user.role != 'TEACHER':
            return Response({'error': 'Only teachers can delete grades'}, status=status.HTTP_403_FORBIDDEN)
        
        grade.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== QUIZ ITEM ANALYSIS VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_item_analysis(request, quiz_id):
    """Get per-question statistics for a quiz"""
    # Only teachers can access item analysis
    if request.user.role != 'TEACHER':
        return Response({'error': 'Only teachers can access item analysis'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        quiz = Quiz.objects.get(id=quiz_id, teacher=request.user)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    
    questions = quiz.questions.all().order_by('order')
    analysis = []
    
    for question in questions:
        # Get all answers for this question from graded attempts
        answers = QuizAnswer.objects.filter(
            question=question,
            attempt__status='GRADED'
        ).select_related('selected_choice')
        
        total_attempts = answers.count()
        
        if total_attempts == 0:
            # No attempts yet
            analysis.append({
                'question_id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'points': question.points,
                'total_attempts': 0,
                'correct_count': 0,
                'incorrect_count': 0,
                'correct_percentage': 0,
                'difficulty': 'N/A',
                'choice_distribution': {}
            })
            continue
        
        # Calculate statistics
        correct_count = answers.filter(is_correct=True).count()
        incorrect_count = total_attempts - correct_count
        correct_percentage = (correct_count / total_attempts * 100) if total_attempts > 0 else 0
        
        # Determine difficulty
        if correct_percentage >= 75:
            difficulty = 'Easy'
        elif correct_percentage >= 50:
            difficulty = 'Medium'
        elif correct_percentage >= 25:
            difficulty = 'Hard'
        else:
            difficulty = 'Very Hard'
        
        # Choice distribution (for multiple choice and true/false)
        choice_distribution = {}
        if question.question_type in ['MULTIPLE_CHOICE', 'TRUE_FALSE']:
            for choice in question.choices.all():
                choice_count = answers.filter(selected_choice=choice).count()
                choice_distribution[choice.choice_text] = {
                    'count': choice_count,
                    'percentage': (choice_count / total_attempts * 100) if total_attempts > 0 else 0,
                    'is_correct': choice.is_correct
                }
        
        analysis.append({
            'question_id': question.id,
            'question_text': question.question_text,
            'question_type': question.question_type,
            'points': question.points,
            'order': question.order,
            'total_attempts': total_attempts,
            'correct_count': correct_count,
            'incorrect_count': incorrect_count,
            'correct_percentage': round(correct_percentage, 2),
            'difficulty': difficulty,
            'choice_distribution': choice_distribution
        })
    
    # Overall quiz statistics
    total_questions = len(questions)
    total_student_attempts = quiz.attempts.filter(status='GRADED').count()
    
    return Response({
        'quiz_id': quiz.id,
        'quiz_title': quiz.title,
        'total_questions': total_questions,
        'total_student_attempts': total_student_attempts,
        'questions': analysis
    })
