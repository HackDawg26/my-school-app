import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QuizResultData {
  score: number;
  total_points: number;
  percentage: number;
  quiz_title: string;
  subject_name: string;
  subject_id?: number;
}

interface GradeForecast {
  predicted_grade: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  performance_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export default function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [forecast, setForecast] = useState<GradeForecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    // Get result data from navigation state
    if (location.state && location.state.result) {
      setResult(location.state.result);
      // Fetch forecast if subject_id is available
      if (location.state.result.subject_id) {
        fetchForecast(location.state.result.subject_id);
      }
    } else {
      // If no data, redirect back to quiz list
      navigate('/student/quiz');
    }
  }, [location, navigate]);

  const fetchForecast = async (subjectId: number) => {
    setLoadingForecast(true);
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/student/grade-forecast/${subjectId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForecast(response.data);
    } catch (error) {
      console.log('No forecast available yet');
    } finally {
      setLoadingForecast(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-700 border-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return '📈';
      case 'STABLE': return '➡️';
      case 'DECLINING': return '📉';
      default: return '';
    }
  };

  if (!result) {
    return <div className="p-8">Loading results...</div>;
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent work! 🌟';
    if (percentage >= 75) return 'Great job! 👏';
    if (percentage >= 60) return 'Good effort! 👍';
    return 'Keep practicing! 💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600">{result.quiz_title}</p>
          <p className="text-sm text-gray-500">{result.subject_name}</p>
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 mb-6 text-white text-center">
          <p className="text-lg mb-2 opacity-90">Your Score</p>
          <div className="text-6xl font-bold mb-2">
            {result.score}/{result.total_points}
          </div>
          <div className={`text-4xl font-bold ${getGradeColor(result.percentage)} bg-white rounded-lg py-2 px-4 inline-block`}>
            {result.percentage.toFixed(1)}%
          </div>
        </div>

        {/* Grade Message */}
        <div className="text-center mb-8">
          <p className="text-2xl font-semibold text-gray-700 mb-4">
            {getGradeMessage(result.percentage)}
          </p>
          <p className="text-gray-600">
            You answered <span className="font-bold">{result.score} out of {result.total_points}</span> points correctly.
          </p>
        </div>

        {/* Performance Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                result.percentage >= 75 ? 'bg-green-500' : 
                result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.percentage}%` }}
            />
          </div>
        </div>

        {/* Thank You Message */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-800 font-medium text-center">
            Thank you for completing this quiz! Keep up the great work! 🎉
          </p>
        </div>

        {/* AI Grade Forecast Section */}
        {forecast && !loadingForecast && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h3 className="text-lg font-bold text-gray-800">AI Grade Forecast</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Predicted Grade</p>
                <p className="text-3xl font-bold text-indigo-600">{forecast.predicted_grade.toFixed(1)}%</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(forecast.risk_level)}`}>
                  {forecast.risk_level}
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Trend</p>
                <p className="text-2xl">{getTrendIcon(forecast.performance_trend)}</p>
                <p className="text-xs font-semibold text-gray-700">{forecast.performance_trend}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/grade-forecast')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors text-sm"
            >
              View Detailed Forecast & Recommendations →
            </button>
          </div>
        )}

        {loadingForecast && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
            <p className="text-gray-600 text-sm">Loading AI forecast...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/student/quiz')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
