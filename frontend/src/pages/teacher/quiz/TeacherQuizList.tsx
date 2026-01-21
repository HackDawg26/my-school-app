import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Quiz {
  id: number;
  quiz_id: string;
  title: string;
  subject_name: string;
  open_time: string;
  close_time: string;
  status: string;
  question_count: number;
  is_open: boolean;
  is_upcoming: boolean;
  is_closed: boolean;
}

export default function TeacherQuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get('http://127.0.0.1:8000/api/teacher/quizzes/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      await axios.delete(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.is_open) return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Open</span>;
    if (quiz.is_upcoming) return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Upcoming</span>;
    if (quiz.is_closed) return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Closed</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{quiz.status}</span>;
  };

  if (loading) return <div className="p-8">Loading quizzes...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link to="/teacher/quiz/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create New Quiz
        </Link>
      </div>

      <div className="grid gap-4">
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No quizzes yet. Create your first quiz!</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{quiz.title}</h2>
                    {getStatusBadge(quiz)}
                  </div>
                  <p className="text-gray-600 mb-2">Subject: {quiz.subject_name}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Quiz ID: {quiz.quiz_id}</p>
                    <p>Opens: {new Date(quiz.open_time).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p>Closes: {new Date(quiz.close_time).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p>Questions: {quiz.question_count}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    to={`/teacher/quiz/${quiz.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
