from openai import OpenAI
from django.conf import settings

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    def chat(self, messages, temperature=0.7, max_tokens=500):
        """
        Send a chat request to OpenAI GPT-3.5 Turbo
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Creativity level (0-1)
            max_tokens: Maximum response length
        
        Returns:
            str: AI response text
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"
    
    def generate_quiz_questions(self, SubjectOffering, topic, num_questions=5):
        """Generate quiz questions for a subject and topic"""
        messages = [
            {"role": "system", "content": "You are an educational assistant that creates quiz questions."},
            {"role": "user", "content": f"Generate {num_questions} multiple choice questions about {topic} in {SubjectOffering.name}. Format each question with 4 options (A, B, C, D) and indicate the correct answer."}
        ]
        return self.chat(messages, temperature=0.8, max_tokens=1000)
    
    def explain_concept(self, concept, SubjectOffering):
        """Explain a concept in simple terms"""
        messages = [
            {"role": "system", "content": "You are a helpful teacher explaining concepts to students in a clear and simple way."},
            {"role": "user", "content": f"Explain the concept of '{concept}' in {SubjectOffering.name} in simple terms that a student can understand."}
        ]
        return self.chat(messages, temperature=0.7)
    
    def provide_feedback(self, student_answer, correct_answer, question):
        """Provide personalized feedback on student answers"""
        messages = [
            {"role": "system", "content": "You are a supportive teacher providing constructive feedback."},
            {"role": "user", "content": f"Question: {question}\nStudent's answer: {student_answer}\nCorrect answer: {correct_answer}\n\nProvide brief, encouraging feedback explaining why the answer is right or wrong."}
        ]
        return self.chat(messages, temperature=0.6, max_tokens=300)
    
    def generate_study_plan(self, SubjectOffering, topics, difficulty_level):
        """Create a personalized study plan"""
        messages = [
            {"role": "system", "content": "You are an educational planner helping students organize their studies."},
            {"role": "user", "content": f"Create a study plan for {SubjectOffering.name} covering these topics: {', '.join(topics)}. The difficulty level is {difficulty_level}. Include time allocation and learning strategies."}
        ]
        return self.chat(messages, temperature=0.7, max_tokens=800)
    
    def predict_grade(self, student_data):
        """
        Predict student's final grade using AI based on quiz performance
        
        Args:
            student_data: Dict containing:
                - student_name: str
                - subject_name: str
                - quiz_scores: List[float] (historical scores)
                - current_average: float
                - quiz_count: int
                - topic_performance: List[Dict] with 'topic', 'accuracy'
                - recent_trend: str (description of recent performance)
        
        Returns:
            Dict with:
                - predicted_grade: float (0-100)
                - confidence: float (0-1)
                - risk_level: str ('LOW', 'MEDIUM', 'HIGH')
                - trend: str ('IMPROVING', 'STABLE', 'DECLINING')
                - strong_topics: List[str]
                - weak_topics: List[str]
                - recommendations: str
        """
        try:
            # Prepare data summary for AI
            quiz_summary = f"Quiz scores: {student_data['quiz_scores']}"
            avg_score = student_data['current_average']
            quiz_count = student_data['quiz_count']
            
            # Topic analysis
            topics_text = "\n".join([
                f"  - {t['topic']}: {t['accuracy']:.1f}% accuracy ({t['correct']}/{t['total']} correct)"
                for t in student_data['topic_performance']
            ])
            
            # Create AI prompt
            prompt = f"""You are an educational data analyst. Analyze this student's quiz performance and provide a grade forecast.

Student: {student_data['student_name']}
Subject: {student_data['subject_name']}
Quizzes Taken: {quiz_count}
Current Average: {avg_score:.1f}%

Quiz Score History: {quiz_summary}
Recent Performance Trend: {student_data['recent_trend']}

Topic-Level Performance:
{topics_text}

Based on this data, provide:
1. Predicted final grade (0-100 scale)
2. Confidence level in prediction (0-1 scale)
3. Risk assessment (LOW/MEDIUM/HIGH) - risk of failing or underperforming
4. Performance trend (IMPROVING/STABLE/DECLINING)
5. Top 3 strong topics (topics with >75% accuracy)
6. Top 3 weak topics (topics with <60% accuracy)
7. Specific study recommendations (2-3 sentences)

Format your response EXACTLY as JSON:
{{
  "predicted_grade": <number>,
  "confidence": <number 0-1>,
  "risk_level": "<LOW/MEDIUM/HIGH>",
  "trend": "<IMPROVING/STABLE/DECLINING>",
  "strong_topics": ["topic1", "topic2", "topic3"],
  "weak_topics": ["topic1", "topic2", "topic3"],
  "recommendations": "<text>"
}}"""

            messages = [
                {"role": "system", "content": "You are an educational data analyst specializing in grade forecasting and student performance analysis. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ]
            
            # Get AI response
            response = self.chat(messages, temperature=0.3, max_tokens=800)
            
            # Parse JSON response
            import json
            import re
            
            # Extract JSON from response (in case AI adds explanation text)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response)
            
            # Validate and sanitize output
            return {
                'predicted_grade': float(result.get('predicted_grade', avg_score)),
                'confidence': float(result.get('confidence', 0.7)),
                'risk_level': result.get('risk_level', 'MEDIUM').upper(),
                'trend': result.get('trend', 'STABLE').upper(),
                'strong_topics': result.get('strong_topics', [])[:3],
                'weak_topics': result.get('weak_topics', [])[:3],
                'recommendations': result.get('recommendations', 'Continue practicing and reviewing material regularly.')
            }
            
        except Exception as e:
            # Fallback to rule-based prediction if AI fails
            return self._fallback_prediction(student_data, str(e))
    
    def _fallback_prediction(self, student_data, error_msg):
        """Rule-based fallback prediction if AI fails"""
        avg = student_data['current_average']
        quiz_count = student_data['quiz_count']
        
        # Simple linear projection
        predicted = avg
        
        # Determine trend from recent scores
        if len(student_data['quiz_scores']) >= 3:
            recent = student_data['quiz_scores'][-3:]
            if recent[-1] > recent[0] + 5:
                trend = 'IMPROVING'
                predicted += 3
            elif recent[-1] < recent[0] - 5:
                trend = 'DECLINING'
                predicted -= 3
            else:
                trend = 'STABLE'
        else:
            trend = 'STABLE'
        
        # Risk assessment
        if avg >= 75:
            risk = 'LOW'
        elif avg >= 60:
            risk = 'MEDIUM'
        else:
            risk = 'HIGH'
        
        # Topic analysis
        topics = sorted(student_data['topic_performance'], key=lambda x: x['accuracy'], reverse=True)
        strong = [t['topic'] for t in topics[:3] if t['accuracy'] >= 75]
        weak = [t['topic'] for t in topics[-3:] if t['accuracy'] < 60]
        
        return {
            'predicted_grade': max(0, min(100, predicted)),
            'confidence': 0.6 if quiz_count >= 3 else 0.4,
            'risk_level': risk,
            'trend': trend,
            'strong_topics': strong,
            'weak_topics': weak,
            'recommendations': f'AI service unavailable. Current average: {avg:.1f}%. Focus on weak areas to improve performance.'
        }
