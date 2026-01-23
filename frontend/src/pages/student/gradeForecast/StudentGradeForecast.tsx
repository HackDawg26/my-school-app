import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface TopicPerformance {
  topic: string;
  topic_name: string;
  accuracy_percentage: number;
  correct_answers: number;
  total_questions: number;
}

interface GradeForecast {
  id: number;
  subject_name: string;
  current_average: number;
  quiz_count: number;
  predicted_grade: number;
  confidence_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  performance_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  strong_topics: string[];
  weak_topics: string[];
  recommendations: string;
  generated_at: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function StudentGradeForecast() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [forecast, setForecast] = useState<GradeForecast | null>(null);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get('http://127.0.0.1:8000/api/subject-offerings/my/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchForecast = async (subjectId: number) => {
    setLoading(true);
    setError('');
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      // Try to get existing forecast
      const response = await axios.get(
        `http://127.0.0.1:8000/api/student/grade-forecast/${subjectId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForecast(response.data);
      
      // Get topic performance
      const topicResponse = await axios.get(
        `http://127.0.0.1:8000/api/student/topic-performance/${subjectId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopicPerformance(topicResponse.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('No forecast available yet. Click "Generate Forecast" to create one.');
      } else {
        setError('Error loading forecast');
      }
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    if (!selectedSubject) return;
    
    setGenerating(true);
    setError('');
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/student/grade-forecast/',
        { SubjectOffering_id: selectedSubject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setForecast(response.data);
      alert('Forecast generated successfully!');
      
      // Fetch topic performance
      const topicResponse = await axios.get(
        `http://127.0.0.1:8000/api/student/topic-performance/${selectedSubject}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopicPerformance(topicResponse.data || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate forecast. Make sure you have completed at least one quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubject(subjectId);
    setForecast(null);
    setTopicPerformance([]);
    fetchForecast(subjectId);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100 border-green-300';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'HIGH': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return '📈 ↗️';
      case 'STABLE': return '➡️';
      case 'DECLINING': return '📉 ↘️';
      default: return '';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 75) return 'text-blue-600';
    if (grade >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Grade Forecasting</h1>
        <p className="text-gray-600">AI-powered predictions based on your quiz performance</p>
      </div>

      {/* Subject Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium mb-2">Select Subject</label>
        <select
          value={selectedSubject || ''}
          onChange={(e) => handleSubjectChange(parseInt(e.target.value))}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Choose a subject...</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading forecast...</p>
        </div>
      )}

      {error && !forecast && selectedSubject && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <p className="text-yellow-800 mb-4">{error}</p>
          <button
            onClick={generateForecast}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {generating ? 'Generating...' : '🤖 Generate AI Forecast'}
          </button>
        </div>
      )}

      {forecast && (
        <>
          {/* Main Forecast Card */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 mb-6 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{forecast.subject_name}</h2>
                <p className="opacity-90">Based on {forecast.quiz_count} quiz{forecast.quiz_count !== 1 ? 'zes' : ''}</p>
              </div>
              <button
                onClick={generateForecast}
                disabled={generating}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-sm disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 mb-1">Current Average</p>
                <p className="text-4xl font-bold">{forecast.current_average.toFixed(1)}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 mb-1">Predicted Grade</p>
                <p className="text-4xl font-bold">{forecast.predicted_grade.toFixed(1)}%</p>
                <p className="text-xs opacity-75 mt-1">Confidence: {(forecast.confidence_score * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 mb-1">Performance Trend</p>
                <p className="text-2xl font-bold">{getTrendIcon(forecast.performance_trend)} {forecast.performance_trend}</p>
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className={`rounded-lg border-2 p-6 mb-6 ${getRiskColor(forecast.risk_level)}`}>
            <h3 className="text-lg font-semibold mb-2">Risk Assessment: {forecast.risk_level}</h3>
            <p className="text-sm">
              {forecast.risk_level === 'LOW' && 'You\'re on track! Keep up the great work.'}
              {forecast.risk_level === 'MEDIUM' && 'You\'re doing okay, but there\'s room for improvement.'}
              {forecast.risk_level === 'HIGH' && 'You may need additional support. Consider meeting with your teacher.'}
            </p>
          </div>

          {/* Strong & Weak Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">💪 Strong Topics</h3>
              {forecast.strong_topics.length > 0 ? (
                <ul className="space-y-2">
                  {forecast.strong_topics.map((topic, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Complete more quizzes to identify strong areas</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-600">📚 Areas to Improve</h3>
              {forecast.weak_topics.length > 0 ? (
                <ul className="space-y-2">
                  {forecast.weak_topics.map((topic, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-orange-600 mr-2">!</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Great! No weak areas identified yet</p>
              )}
            </div>
          </div>

          {/* Topic Performance Details */}
          {topicPerformance.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">📊 Detailed Topic Performance</h3>
              <div className="space-y-3">
                {topicPerformance.map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{topic.topic_name || topic.topic}</span>
                      <span className={`font-semibold ${getGradeColor(topic.accuracy_percentage || 0)}`}>
                        {(topic.accuracy_percentage || 0).toFixed(1)}% ({topic.correct_answers}/{topic.total_questions})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (topic.accuracy_percentage || 0) >= 75 ? 'bg-green-500' : 
                          (topic.accuracy_percentage || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${topic.accuracy_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 AI Recommendations</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-700 whitespace-pre-line">{forecast.recommendations}</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Generated on {new Date(forecast.generated_at).toLocaleDateString()} at {new Date(forecast.generated_at).toLocaleTimeString()}
            </p>
          </div>
        </>
      )}

      {!selectedSubject && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Subject</h3>
          <p className="text-gray-600">Choose a subject above to view your grade forecast</p>
        </div>
      )}
    </div>
  );
}
