import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BarChart3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ChoiceDistribution {
  [choiceText: string]: {
    count: number;
    percentage: number;
    is_correct: boolean;
  };
}

interface QuestionAnalysis {
  question_id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  total_attempts: number;
  correct_count: number;
  incorrect_count: number;
  correct_percentage: number;
  difficulty: string;
  choice_distribution: ChoiceDistribution;
}

interface ItemAnalysisData {
  quiz_id: number;
  quiz_title: string;
  total_questions: number;
  total_student_attempts: number;
  questions: QuestionAnalysis[];
}

export default function QuizItemAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ItemAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemAnalysis();
  }, [id]);

  const fetchItemAnalysis = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get(
        `http://127.0.0.1:8000/api/teacher/quizzes/${id}/item-analysis/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching item analysis:', error);
      alert('Failed to load item analysis');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Hard': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Very Hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 75) return <CheckCircle className="text-green-600" size={20} />;
    if (percentage >= 50) return <AlertCircle className="text-yellow-600" size={20} />;
    return <XCircle className="text-red-600" size={20} />;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center">Loading item analysis...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-red-600">Failed to load item analysis</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(`/teacher/quiz/${id}`)}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft size={20} />
        Back to Quiz
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold">{data.quiz_title}</h1>
            <p className="text-gray-600">Item Analysis Report</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="text-2xl font-bold text-blue-600">{data.total_questions}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Student Attempts</p>
            <p className="text-2xl font-bold text-green-600">{data.total_student_attempts}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600">Avg Success Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.questions.length > 0
                ? (data.questions.reduce((sum, q) => sum + q.correct_percentage, 0) / data.questions.length).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* No Attempts Message */}
      {data.total_student_attempts === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>No student attempts yet.</strong> Item analysis will be available after students complete the quiz.
          </p>
        </div>
      )}

      {/* Question Analysis */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Question-by-Question Analysis</h2>

        {data.questions.map((question, index) => (
          <div key={question.question_id} className="bg-white rounded-lg shadow p-6">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPerformanceIcon(question.correct_percentage)}
                  <h3 className="text-lg font-semibold">
                    Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{question.question_text}</p>
                <p className="text-xs text-gray-500">Type: {question.question_type.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-600">Total Attempts</p>
                <p className="text-xl font-bold">{question.total_attempts}</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs text-gray-600">Correct</p>
                <p className="text-xl font-bold text-green-600">{question.correct_count}</p>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-xs text-gray-600">Incorrect</p>
                <p className="text-xl font-bold text-red-600">{question.incorrect_count}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs text-gray-600">Success Rate</p>
                <p className="text-xl font-bold text-blue-600">{question.correct_percentage.toFixed(1)}%</p>
              </div>
            </div>

            {/* Choice Distribution */}
            {question.total_attempts > 0 && Object.keys(question.choice_distribution).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Answer Choice Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(question.choice_distribution).map(([choiceText, stats]) => (
                    <div key={choiceText} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${stats.is_correct ? 'text-green-700' : 'text-gray-700'}`}>
                            {stats.is_correct && '✓ '}{choiceText}
                          </span>
                          <span className="text-sm text-gray-600">
                            {stats.count} ({stats.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full flex items-center justify-end pr-2 text-xs text-white font-medium ${
                              stats.is_correct ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${stats.percentage}%` }}
                          >
                            {stats.percentage > 10 && `${stats.percentage.toFixed(0)}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {question.total_attempts > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-medium text-blue-800">📌 Recommendations:</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  {question.correct_percentage < 50 && (
                    <li>• This question was challenging for most students. Consider reviewing this topic in class.</li>
                  )}
                  {question.correct_percentage >= 75 && (
                    <li>• Students performed well on this question. The concept is well understood.</li>
                  )}
                  {question.question_type === 'MULTIPLE_CHOICE' && 
                   Object.values(question.choice_distribution).some(s => !s.is_correct && s.percentage > 30) && (
                    <li>• A distractor choice has high selection rate. Review why students might be confused.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
