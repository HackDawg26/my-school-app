import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Quiz {
  id: number;
  quiz_id: string;
  title: string;
  subject_name: string;
  teacher_name: string;
  open_time: string;
  close_time: string;
  time_limit: number;
  total_points: number;
  question_count: number;
  is_open: boolean;
  is_upcoming: boolean;
  is_closed: boolean;
  user_attempts: number;
  allow_multiple_attempts: boolean;
}

type SubjectOfferingCard = {
  id: number;
  subject_name: string;
};

export default function StudentQuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [offerings, setOfferings] = useState<SubjectOfferingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchOfferings(), fetchQuizzes()]);
      setLoading(false);
    })();
  }, []);

  const getToken = () => {
    // Prefer the same key you used in other pages:
    const access = localStorage.getItem('access');
    if (access) return access;

    // fallback to your "user" storage if needed
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).token : null;
  };

  const fetchOfferings = async () => {
    try {
      const token = getToken();
      const res = await axios.get('http://127.0.0.1:8000/api/student/subject-offerings/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOfferings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching offerings:', e);
      setOfferings([]);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const token = getToken();
      const res = await axios.get('http://127.0.0.1:8000/api/student/quizzes/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching quizzes:', e);
      setQuizzes([]);
    }
  };

  // ✅ allowed subjects (normalize to avoid minor spacing/case mismatches)
  const allowedSubjects = useMemo(() => {
    return new Set(
      offerings
        .map(o => (o.subject_name || '').trim().toLowerCase())
        .filter(Boolean)
    );
  }, [offerings]);

  // ✅ filter quizzes: only those in student offerings
  const visibleQuizzes = useMemo(() => {
    return quizzes.filter(q =>
      allowedSubjects.has((q.subject_name || '').trim().toLowerCase())
    );
  }, [quizzes, allowedSubjects]);

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.is_open) return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Open Now</span>;
    if (quiz.is_upcoming) return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Upcoming</span>;
    if (quiz.is_closed) return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Closed</span>;
    return null;
  };

  const canTakeQuiz = (quiz: Quiz) => {
    if (!quiz.is_open) return false;
    if (!quiz.allow_multiple_attempts && quiz.user_attempts > 0) return false;
    return true;
  };

  if (loading) return <div className="p-8">Loading quizzes...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>

      <div className="grid gap-4">
        {visibleQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No quizzes available at the moment.</p>
          </div>
        ) : (
          visibleQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{quiz.title}</h2>
                    {getStatusBadge(quiz)}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">Subject: {quiz.subject_name}</p>
                    <p>Teacher: {quiz.teacher_name}</p>
                    <p>Questions: {quiz.question_count} | Points: {quiz.total_points} | Time: {quiz.time_limit} minutes</p>
                  </div>

                  <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                    {quiz.is_upcoming && (
                      <p className="text-blue-600 font-medium">
                        Opens: {new Date(quiz.open_time).toLocaleString()}
                      </p>
                    )}
                    {quiz.is_open && (
                      <p className="text-green-600 font-medium">
                        Closes: {new Date(quiz.close_time).toLocaleString()}
                      </p>
                    )}
                    {quiz.is_closed && (
                      <p className="text-gray-600">
                        Closed: {new Date(quiz.close_time).toLocaleString()}
                      </p>
                    )}
                    {quiz.user_attempts > 0 && (
                      <p className="text-gray-600">
                        Attempts: {quiz.user_attempts} {!quiz.allow_multiple_attempts && '(No more attempts allowed)'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {canTakeQuiz(quiz) ? (
                    <Link
                      to={`/student/quiz/${quiz.id}/take`}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                    >
                      Take Quiz
                    </Link>
                  ) : quiz.is_upcoming ? (
                    <div className="px-6 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">Not Yet Open</div>
                  ) : quiz.is_closed ? (
                    <div className="px-6 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">Closed</div>
                  ) : (
                    <div className="px-6 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">Already Taken</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
