# Grade Forecasting Feature - Documentation

## Overview
The Grade Forecasting feature uses AI to predict student final grades based on quiz performance data. It analyzes historical quiz scores, topic-level performance, and trends to provide actionable insights for both students and teachers.

## How It Works

### 1. **Data Collection**
- System automatically tracks every quiz attempt
- Records: student_id, quiz_id, question_id, score, correct/incorrect per question
- Organizes by topic (currently uses quiz titles as topics)
- Timestamps all quiz attempts for trend analysis

### 2. **Performance Analysis**
The system analyzes:
- **Average Quiz Score**: Overall performance across all quizzes
- **Score Trend**: Compares recent quizzes vs earlier ones (Improving/Stable/Declining)
- **Topic Accuracy**: Calculates correctness percentage per topic
- **Strong Topics**: Topics with >75% accuracy
- **Weak Topics**: Topics with <60% accuracy

### 3. **AI Prediction**
When generating a forecast, the system:
1. Aggregates all quiz data for the student in that subject
2. Prepares a structured summary including:
   - Historical quiz scores: [85, 78, 92, ...]
   - Current average: 85%
   - Number of quizzes taken: 5
   - Topic performance breakdown
   - Recent trend description

3. Sends this data to the AI model (OpenAI GPT) with a specialized prompt
4. AI analyzes patterns and returns:
   - **Predicted Final Grade**: Estimated final grade (0-100)
   - **Confidence Score**: How confident the AI is (0-1)
   - **Risk Level**: LOW/MEDIUM/HIGH (risk of underperforming)
   - **Performance Trend**: IMPROVING/STABLE/DECLINING
   - **Strong Topics**: Areas where student excels
   - **Weak Topics**: Areas needing improvement
   - **Recommendations**: Specific study suggestions

### 4. **Fallback System**
If AI is unavailable, a rule-based system kicks in:
- Uses statistical analysis of quiz scores
- Applies simple trend detection
- Provides basic predictions without AI

### 5. **Data Storage**
Results are stored in the database:
- `GradeForecast` table: AI predictions and analysis
- `QuizTopicPerformance` table: Per-topic accuracy records
- Timestamps track when predictions were generated
- Can be regenerated anytime with latest quiz data

## Database Schema

### QuizTopicPerformance
```python
- student (FK): Which student
- subject (FK): Which subject
- topic (string): Topic/quiz name
- total_questions (int): Total questions answered
- correct_answers (int): Number correct
- accuracy_percentage (float): Calculated accuracy
- last_updated (datetime): Last update time
```

### GradeForecast
```python
- student (FK): Which student
- subject (FK): Which subject
- current_average (float): Current quiz average
- quiz_count (int): Number of quizzes taken
- predicted_grade (float): AI prediction (0-100)
- confidence_score (float): AI confidence (0-1)
- risk_level (choice): LOW/MEDIUM/HIGH
- performance_trend (choice): IMPROVING/STABLE/DECLINING
- strong_topics (JSON): List of strong topics
- weak_topics (JSON): List of weak topics
- recommendations (text): Study recommendations
- generated_at (datetime): When created
- updated_at (datetime): Last updated
```

## API Endpoints

### 1. Get Student Analytics
```
GET /api/student/grade-analytics/?subject_id=1
```
Returns comprehensive analytics including quiz scores, trends, and existing forecast

### 2. Generate Forecast
```
POST /api/student/grade-forecast/
Body: { "subject_id": 1 }
```
Generates new AI prediction for the subject

### 3. Get Existing Forecast
```
GET /api/student/grade-forecast/1/  (subject_id=1)
```
Retrieves saved forecast for a subject

### 4. Get Topic Performance
```
GET /api/student/topic-performance/1/  (subject_id=1)
```
Gets detailed per-topic accuracy data

## Example AI Input/Output

### Input to AI:
```json
{
  "student_name": "John Smith",
  "subject_name": "Mathematics",
  "quiz_count": 5,
  "current_average": 82.4,
  "quiz_scores": [75, 80, 85, 88, 84],
  "recent_trend": "Improving (recent avg 85.7% vs earlier 77.5%)",
  "topic_performance": [
    {"topic": "Algebra", "accuracy": 90.0, "correct": 9, "total": 10},
    {"topic": "Geometry", "accuracy": 75.0, "correct": 6, "total": 8},
    {"topic": "Calculus", "accuracy": 55.0, "correct": 11, "total": 20}
  ]
}
```

### Output from AI:
```json
{
  "predicted_grade": 85.5,
  "confidence": 0.78,
  "risk_level": "LOW",
  "trend": "IMPROVING",
  "strong_topics": ["Algebra", "Geometry"],
  "weak_topics": ["Calculus"],
  "recommendations": "Focus on calculus practice. Your improvement trend is positive. Continue current study habits for algebra and geometry while dedicating extra time to calculus fundamentals."
}
```

## Usage Flow

### For Students:
1. Take quizzes as normal (minimum 1 quiz needed)
2. Request grade forecast from dashboard/subject page
3. System generates prediction showing:
   - Expected final grade
   - Risk assessment
   - Strong/weak areas
   - Study recommendations
4. Can regenerate forecast after each new quiz for updated predictions

### For Teachers:
- Can view forecasts for all students in their classes
- Identify at-risk students (HIGH risk level)
- See class-wide trends
- Use insights for targeted interventions

## Important Notes

### ✅ What AI Does:
- **Data Analytics**: Analyzes patterns in quiz performance
- **Forecasting**: Predicts likely outcomes based on trends
- **Recommendations**: Suggests study strategies
- **Risk Assessment**: Identifies students who may struggle

### ❌ What AI Does NOT Do:
- **Auto-grading**: Teachers still grade manually when needed
- **Decision Making**: AI only provides insights, not decisions
- **Enforcement**: No automatic actions based on predictions
- **Replace Teachers**: AI assists, teachers make final judgments

## Modular Design
The system is designed to be extended:
- Can add exam data later alongside quiz data
- Topic field can be enhanced with actual categorization
- Additional analytics can be plugged in
- AI model can be swapped (currently OpenAI, can use others)

## Testing the Feature

1. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

2. **Have students complete quizzes** (at least 1 per subject)

3. **Generate forecast via API**:
   ```bash
   POST /api/student/grade-forecast/
   {
     "subject_id": 1
   }
   ```

4. **View results**:
   ```bash
   GET /api/student/grade-analytics/?subject_id=1
   ```

## Client Explanation Summary

**"The Grade Forecasting feature is like having a personal academic advisor powered by AI. Here's what it does:**

1. **Tracks Performance**: Every time a student takes a quiz, we record their scores and which topics they got right or wrong.

2. **Analyzes Patterns**: Our AI looks at their quiz history and identifies patterns - are they improving? Which topics are they strong in? Which need work?

3. **Predicts Outcomes**: Based on current performance and trends, the AI predicts what their final grade might be.

4. **Provides Guidance**: The system tells students exactly which topics to focus on and gives specific study recommendations.

5. **Identifies At-Risk Students**: Teachers can see which students are at risk of underperforming and provide help early.

**Important**: The AI only provides insights and recommendations - it doesn't make decisions or grade automatically. Teachers stay in control. It's a tool to help students improve and teachers intervene early when students struggle.

**Think of it as an early warning system combined with a personalized study coach."**
