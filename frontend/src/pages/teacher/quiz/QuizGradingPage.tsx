import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authFetch } from '../../lib/api';

interface StudentAnswer {
  id: number;
  question: number;
  question_text: string;
  question_points: number;
  selected_choice: number | null;
  text_answer: string;
  answer_file: string | null;
  answer_file_url: string;
  is_correct: boolean | null;
  points_earned: number;
  manually_graded: boolean;
  teacher_feedback: string;
  graded_at: string | null;
  graded_by_name: string | null;
}

interface StudentSubmission {
  attempt_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  submitted_at: string;
  score: number;
  status: string;
  answers: StudentAnswer[];
}

export default function QuizGradingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      const token = localStorage.getItem('access');
      
      // Fetch quiz details
      const quizRes = await authFetch(`/api/teacher/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const quizData = await quizRes.json();
      setQuiz(quizData);

      // Fetch student answers
      const answersRes = await authFetch(`/api/teacher/quizzes/${id}/student_answers/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const answersData = await answersRes.json();
      setSubmissions(answersData);

      if (answersData.length > 0) {
        setSelectedStudent(answersData[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      setLoading(false);
    }
  };

  const handleGradeAnswer = async (answerId: number, points: number, feedback: string) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access');
      const response = await authFetch('/api/teacher/quizzes/grade-answer/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answer_id: answerId,
          points_earned: points,
          feedback: feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh data
        await fetchQuizData();
        alert('Answer graded successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to grade answer'}`);
      }
    } catch (error) {
      console.error('Error grading answer:', error);
      alert('Failed to grade answer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quiz data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Quiz
        </button>
        <h1 className="text-3xl font-bold">{quiz?.title} - Manual Grading</h1>
        <p className="text-gray-600 mt-2">
          Total Points: {quiz?.total_points} | Submissions: {submissions.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Students</h2>
            <div className="space-y-2">
              {submissions.map((submission) => (
                <button
                  key={submission.attempt_id}
                  onClick={() => setSelectedStudent(submission)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedStudent?.attempt_id === submission.attempt_id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium">{submission.student_name}</div>
                  <div className="text-sm text-gray-600">
                    Score: {submission.score?.toFixed(1) || '0'} / {quiz?.total_points}
                  </div>
                  <div className={`text-xs mt-1 ${
                    submission.status === 'GRADED' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {submission.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Answer Grading */}
        <div className="lg:col-span-3">
          {selectedStudent ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">{selectedStudent.student_name}</h2>
                <p className="text-gray-600">{selectedStudent.student_email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted: {new Date(selectedStudent.submitted_at).toLocaleString()}
                </p>
                <div className="mt-2">
                  <span className="text-lg font-semibold">
                    Total Score: {selectedStudent.score?.toFixed(1) || '0'} / {quiz?.total_points}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {selectedStudent.answers.map((answer, index) => (
                  <AnswerGradingCard
                    key={answer.id}
                    answer={answer}
                    index={index}
                    onGrade={handleGradeAnswer}
                    saving={saving}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Select a student to view and grade their answers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnswerGradingCardProps {
  answer: StudentAnswer;
  index: number;
  onGrade: (answerId: number, points: number, feedback: string) => Promise<void>;
  saving: boolean;
}

function AnswerGradingCard({ answer, index, onGrade, saving }: AnswerGradingCardProps) {
  const [points, setPoints] = useState(answer.points_earned.toString());
  const [feedback, setFeedback] = useState(answer.teacher_feedback || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async () => {
    await onGrade(answer.id, parseFloat(points), feedback);
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Question {index + 1}</h3>
            <p className="text-gray-700 mt-2">{answer.question_text}</p>
            <p className="text-sm text-gray-500 mt-1">Worth: {answer.question_points} points</p>
          </div>
        </div>
      </div>

      {/* Student's Answer */}
      <div className="mt-4 bg-white p-4 rounded border">
        <p className="font-medium text-sm text-gray-600 mb-2">Student's Answer:</p>
        
        {answer.text_answer && (
          <p className="text-gray-800">{answer.text_answer}</p>
        )}

        {answer.answer_file_url && (
          <div className="mt-2">
            <a
              href={`http://127.0.0.1:8000${answer.answer_file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
            >
              📎 View Uploaded File
            </a>
          </div>
        )}

        {answer.selected_choice && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Selected Choice ID: {answer.selected_choice}</p>
            {answer.is_correct !== null && (
              <span className={`inline-block px-2 py-1 rounded text-sm ${
                answer.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grading Section */}
      <div className="mt-4 bg-blue-50 p-4 rounded border border-blue-200">
        {!isEditing && answer.manually_graded ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-green-700">✓ Graded</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={saving}
              >
                Edit Grade
              </button>
            </div>
            <p className="text-lg font-semibold">
              Points Earned: {answer.points_earned} / {answer.question_points}
            </p>
            {answer.teacher_feedback && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-600">Feedback:</p>
                <p className="text-gray-700">{answer.teacher_feedback}</p>
              </div>
            )}
            {answer.graded_at && (
              <p className="text-xs text-gray-500 mt-2">
                Graded by {answer.graded_by_name} on {new Date(answer.graded_at).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium mb-3">Grade this answer:</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points Earned (Max: {answer.question_points})
                </label>
                <input
                  type="number"
                  min="0"
                  max={answer.question_points}
                  step="0.5"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Provide feedback to the student..."
                  disabled={saving}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving || parseFloat(points) > answer.question_points}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Grade'}
                </button>
                {isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPoints(answer.points_earned.toString());
                      setFeedback(answer.teacher_feedback || '');
                    }}
                    disabled={saving}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
