import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Subject {
  id: number;
  name: string;
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    open_time: '',
    close_time: '',
    time_limit: 60,
    total_points: 100,
    passing_score: 60,
    status: 'SCHEDULED',  // Changed from DRAFT to SCHEDULED so students can see it
    show_correct_answers: false,
    shuffle_questions: false,
    allow_multiple_attempts: false,
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [useCustomSubject, setUseCustomSubject] = useState(false);

  useEffect(() => {
    // Fetch subjects from backend API
    const fetchSubjects = async () => {
      try {
        const savedUser = localStorage.getItem('school_user');
        const token = savedUser ? JSON.parse(savedUser).token : null;
        const response = await axios.get('http://127.0.0.1:8000/api/subjects/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        // Fallback to hardcoded subjects if API fails
        setSubjects([
          { id: 1, name: 'Mathematics' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'English' },
          { id: 4, name: 'History' },
          { id: 5, name: 'Filipino' },
          { id: 6, name: 'Computer Science' },
        ]);
      }
    };
    
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use custom subject if provided, otherwise use selected
    const subjectId = useCustomSubject ? 1 : formData.subject;
    
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      // Convert local datetime to ISO format (will include timezone offset)
      const quizData = {
        ...formData,
        subject: subjectId,
        open_time: new Date(formData.open_time).toISOString(),
        close_time: new Date(formData.close_time).toISOString()
      };
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/teacher/quizzes/',
        quizData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Quiz created response:', response.data);
      
      // Check if response has the quiz ID
      if (response.data && response.data.id) {
        alert('Quiz created successfully! Now add questions to your quiz.');
        navigate(`/teacher/quiz/${response.data.id}`);
      } else {
        console.error('No quiz ID in response:', response.data);
        alert('Quiz created but navigation failed. Please check quiz list.');
        navigate('/teacher/quiz');
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to create quiz: ${JSON.stringify(error.response?.data || 'Unknown error')}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Subject *</label>
          <div className="space-y-2">
            {!useCustomSubject ? (
              <>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUseCustomSubject(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Or enter custom subject name
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter subject name (e.g., Physics, Arts)"
                />
                <button
                  type="button"
                  onClick={() => setUseCustomSubject(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Choose from list instead
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Midterm Exam - Algebra"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Quiz instructions or description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Open Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.open_time}
              onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Close Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.close_time}
              onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total Points</label>
            <input
              type="number"
              value={formData.total_points}
              onChange={(e) => setFormData({ ...formData, total_points: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passing Score</label>
            <input
              type="number"
              value={formData.passing_score}
              onChange={(e) => setFormData({ ...formData, passing_score: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="DRAFT">Draft (Not visible to students)</option>
            <option value="SCHEDULED">Scheduled (Visible to students)</option>
            <option value="OPEN">Open (Available now)</option>
            <option value="CLOSED">Closed</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use "Scheduled" to make quiz visible to students. The quiz will automatically open/close based on the times you set.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.show_correct_answers}
              onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
            />
            <span className="text-sm">Show correct answers after submission</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.shuffle_questions}
              onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
            />
            <span className="text-sm">Shuffle questions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allow_multiple_attempts}
              onChange={(e) => setFormData({ ...formData, allow_multiple_attempts: e.target.checked })}
            />
            <span className="text-sm">Allow multiple attempts</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Quiz
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/quiz')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
