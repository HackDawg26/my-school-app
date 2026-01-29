import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Quiz {
  id: number;
  subject: number;
  title: string;
  subject_name: string;
  description: string;
  time_limit: number;
  total_points: number;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  choices: Choice[];
}

interface Choice {
  id: number;
  choice_text: string;
}

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [fileAnswers, setFileAnswers] = useState<Record<number, File>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.post(
        `http://127.0.0.1:8000/api/student/quizzes/${id}/start/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Quiz start response:', response.data);
      
      // Validate response data
      if (!response.data.quiz) {
        throw new Error('Quiz data not found in response');
      }
      if (!response.data.questions) {
        console.warn('No questions found in response');
        setQuestions([]);
      } else {
        setQuestions(response.data.questions);
      }
      
      setQuiz(response.data.quiz);
      setAttemptId(response.data.attempt_id);
      setTimeLeft(response.data.quiz.time_limit * 60); // Convert minutes to seconds
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error || error.message || 'Failed to start quiz');
      navigate('/student/activities');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!attemptId) return;

    const answersArray = questions.map((question) => {
      const answer: any = {
        question_id: question.id,
      };

      // For multiple choice and true/false, include selected_choice_id
      if (question.question_type === 'MULTIPLE_CHOICE' || question.question_type === 'TRUE_FALSE') {
        if (answers[question.id]) {
          answer.selected_choice_id = answers[question.id];
        }
      }
      
      // For short answer, include text_answer
      if (question.question_type === 'SHORT_ANSWER') {
        answer.text_answer = textAnswers[question.id] || '';
      }

      return answer;
    });

    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      // Create FormData to support file uploads
      const formData = new FormData();
      formData.append('answers', JSON.stringify(answersArray));
      
      // Add file uploads
      Object.entries(fileAnswers).forEach(([questionId, file]) => {
        formData.append(`answer_file_${questionId}`, file);
      });
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/student/quiz-attempts/${attemptId}/submit/`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      // Navigate to results page with quiz data
      if (!quiz) {
        console.error('Quiz object is null');
        return;
      }
      
      navigate('/student/activities/result', {
        state: {
          result: {
            score: response.data.score,
            total_points: response.data.total_points,
            percentage: response.data.percentage,
            quiz_title: quiz.title,
            subject_name: quiz.subject_name,
            subject_id: quiz.subject
          }
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8">Loading quiz...</div>;
  if (!quiz) return <div className="p-8">Quiz not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.subject_name}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600">Time Remaining</p>
          </div>
        </div>
        {quiz.description && (
          <p className="mt-4 text-gray-700 border-t pt-4">{quiz.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {questions && questions.length > 0 ? questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-6">
            <p className="font-medium mb-4">
              {index + 1}. {question.question_text}
              <span className="text-sm text-gray-500 ml-2">({question.points} point{question.points !== 1 ? 's' : ''})</span>
            </p>

            {question.question_type === 'MULTIPLE_CHOICE' && question.choices && question.choices.length > 0 && (
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className={`flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      answers[question.id] === choice.id ? 'border-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choice.id}
                      checked={answers[question.id] === choice.id}
                      onChange={() => setAnswers({ ...answers, [question.id]: choice.id })}
                      className="mr-3"
                    />
                    <span>{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'MULTIPLE_CHOICE' && (!question.choices || question.choices.length === 0) && (
              <p className="text-red-600 text-sm">No choices available for this question.</p>
            )}

            {question.question_type === 'TRUE_FALSE' && question.choices && question.choices.length > 0 && (
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className={`flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      answers[question.id] === choice.id ? 'border-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choice.id}
                      checked={answers[question.id] === choice.id}
                      onChange={() => setAnswers({ ...answers, [question.id]: choice.id })}
                      className="mr-3"
                    />
                    <span className="font-medium">{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'TRUE_FALSE' && (!question.choices || question.choices.length === 0) && (
              <p className="text-red-600 text-sm">No choices available for this question.</p>
            )}

            {question.question_type === 'SHORT_ANSWER' && (
              <div>
                <textarea
                  value={textAnswers[question.id] || ''}
                  onChange={(e) => setTextAnswers({ ...textAnswers, [question.id]: e.target.value })}
                  className="w-full border rounded p-3 min-h-[100px] mb-3"
                  placeholder="Type your answer here..."
                />
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or upload a file (optional):
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileAnswers({ ...fileAnswers, [question.id]: file });
                      }
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  {fileAnswers[question.id] && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File selected: {fileAnswers[question.id].name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No questions available for this quiz.
          </div>
        )}
      </div>

      {questions && questions.length > 0 && (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Answered: {Object.keys(answers).length + Object.keys(textAnswers).length} / {questions.length}
          </p>
          <button
            onClick={submitQuiz}
            className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Submit Quiz
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
