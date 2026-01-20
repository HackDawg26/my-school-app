import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Quiz {
  id: number;
  quiz_id: string;
  title: string;
  subject_name: string;
  description: string;
  open_time: string;
  close_time: string;
  time_limit: number;
  total_points: number;
  status: string;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  choices: Choice[];
}

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  order: number;
}

export default function ManageQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    points: 1,
    order: 0,
    choices: [
      { choice_text: '', is_correct: false, order: 0 },
      { choice_text: '', is_correct: false, order: 1 },
      { choice_text: '', is_correct: false, order: 2 },
      { choice_text: '', is_correct: false, order: 3 },
    ]
  });

  const [editingTimes, setEditingTimes] = useState(false);
  const [times, setTimes] = useState({ open_time: '', close_time: '' });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestion, setEditQuestion] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(response.data);
      setNewStatus(response.data.status);
      
      // Convert UTC datetime to local datetime for datetime-local input
      const openDate = new Date(response.data.open_time);
      const closeDate = new Date(response.data.close_time);
      
      // Format as YYYY-MM-DDTHH:mm for datetime-local input (in local timezone)
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setTimes({
        open_time: formatDateTimeLocal(openDate),
        close_time: formatDateTimeLocal(closeDate),
      });
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/questions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const updateTimes = async () => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      // Convert local datetime-local input to ISO string (will be in UTC)
      const openDate = new Date(times.open_time);
      const closeDate = new Date(times.close_time);
      
      await axios.patch(
        `http://127.0.0.1:8000/api/teacher/quizzes/${id}/update_times/`,
        {
          open_time: openDate.toISOString(),
          close_time: closeDate.toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Times updated successfully!');
      setEditingTimes(false);
      fetchQuiz();
    } catch (error: any) {
      console.error('Error updating times:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('school_user');
        window.location.href = '/login';
      } else {
        alert('Failed to update times');
      }
    }
  };

  const updateStatus = async () => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      await axios.patch(
        `http://127.0.0.1:8000/api/teacher/quizzes/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status updated successfully!');
      setEditingStatus(false);
      fetchQuiz();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const addQuestion = async () => {
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      // Prepare question data based on question type
      let questionData: any = {
        ...newQuestion,
        order: questions.length,
      };

      // Include choices for MULTIPLE_CHOICE
      if (newQuestion.question_type === 'MULTIPLE_CHOICE') {
        questionData.choices = newQuestion.choices;
      }
      
      // For TRUE_FALSE, automatically create True and False choices
      if (newQuestion.question_type === 'TRUE_FALSE') {
        // Determine which option is correct based on the radio button selection
        const isTrueCorrect = newQuestion.choices[0]?.is_correct || false;
        
        questionData.choices = [
          { choice_text: 'True', is_correct: isTrueCorrect, order: 0 },
          { choice_text: 'False', is_correct: !isTrueCorrect, order: 1 }
        ];
      }
      
      await axios.post(
        `http://127.0.0.1:8000/api/teacher/quizzes/${id}/add_question/`,
        questionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Question added successfully!');
      setShowAddQuestion(false);
      fetchQuestions();
      setNewQuestion({
        question_text: '',
        question_type: 'MULTIPLE_CHOICE',
        points: 1,
        order: 0,
        choices: [
          { choice_text: '', is_correct: false, order: 0 },
          { choice_text: '', is_correct: false, order: 1 },
          { choice_text: '', is_correct: false, order: 2 },
          { choice_text: '', is_correct: false, order: 3 },
        ]
      });
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (!confirm('Delete this question?')) return;
    
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      await axios.delete(`http://127.0.0.1:8000/api/teacher/questions/${questionId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const startEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      points: question.points,
      choices: question.choices || []
    });
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;
    
    try {
      const savedUser = localStorage.getItem('school_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      let questionData: any = { ...editQuestion };
      
      // For TRUE_FALSE, ensure proper choices
      if (editQuestion.question_type === 'TRUE_FALSE') {
        const isTrueCorrect = editQuestion.choices[0]?.is_correct || false;
        questionData.choices = [
          { choice_text: 'True', is_correct: isTrueCorrect, order: 0 },
          { choice_text: 'False', is_correct: !isTrueCorrect, order: 1 }
        ];
      }
      
      await axios.put(
        `http://127.0.0.1:8000/api/teacher/questions/${editingQuestion.id}/`,
        questionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Question updated successfully!');
      setEditingQuestion(null);
      setEditQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  if (!quiz) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/teacher/quiz')} className="text-blue-600 hover:underline">
          ← Back to Quizzes
        </button>
        <button
          onClick={() => navigate(`/teacher/quiz/${id}/item-analysis`)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
        >
          📊 View Item Analysis
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Subject: <span className="font-medium">{quiz.subject_name}</span></p>
            <p className="text-gray-600">Quiz ID: <span className="font-medium">{quiz.quiz_id}</span></p>
            <div className="text-gray-600">
              Status: {!editingStatus ? (
                <>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    quiz.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    quiz.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    quiz.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{quiz.status}</span>
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="ml-2 text-blue-600 hover:underline text-xs"
                  >
                    Change
                  </button>
                </>
              ) : (
                <div className="inline-flex items-center gap-2 mt-1">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="DRAFT">Draft (Hidden from students)</option>
                    <option value="SCHEDULED">Scheduled (Visible to students)</option>
                    <option value="OPEN">Open (Force open now)</option>
                    <option value="CLOSED">Closed (Force closed)</option>
                  </select>
                  <button onClick={updateStatus} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                    Save
                  </button>
                  <button onClick={() => { setEditingStatus(false); setNewStatus(quiz.status); }} className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-gray-600">Time Limit: <span className="font-medium">{quiz.time_limit} minutes</span></p>
            <p className="text-gray-600">Total Points: <span className="font-medium">{quiz.total_points}</span></p>
            <p className="text-gray-600">Questions: <span className="font-medium">{questions.length}</span></p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          {!editingTimes ? (
            <div>
              <p className="text-sm text-gray-600">
                Open: {new Date(quiz.open_time).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-sm text-gray-600">
                Close: {new Date(quiz.close_time).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <button
                onClick={() => setEditingTimes(true)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Change Times
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Open Time</label>
                <input
                  type="datetime-local"
                  value={times.open_time}
                  onChange={(e) => setTimes({ ...times, open_time: e.target.value })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Close Time</label>
                <input
                  type="datetime-local"
                  value={times.close_time}
                  onChange={(e) => setTimes({ ...times, close_time: e.target.value })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={updateTimes} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save
                </button>
                <button onClick={() => setEditingTimes(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Questions</h2>
          <button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showAddQuestion ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {showAddQuestion && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold mb-3">Add New Question</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Question Type *</label>
                <select
                  value={newQuestion.question_type}
                  onChange={(e) => setNewQuestion({ 
                    ...newQuestion, 
                    question_type: e.target.value,
                    choices: e.target.value === 'MULTIPLE_CHOICE' ? [
                      { choice_text: '', is_correct: false, order: 0 },
                      { choice_text: '', is_correct: false, order: 1 },
                      { choice_text: '', is_correct: false, order: 2 },
                      { choice_text: '', is_correct: false, order: 3 },
                    ] : []
                  })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Identification / Short Answer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Question Text *</label>
                <textarea
                  required
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Enter your question here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Points *</label>
                <input
                  type="number"
                  required
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseFloat(e.target.value) })}
                  className="border rounded px-3 py-2 w-32"
                  min="0.5"
                  step="0.5"
                />
              </div>
              
              {newQuestion.question_type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Answer Choices *</label>
                  <p className="text-xs text-gray-500 mb-2">Enter at least 2 choices and mark the correct answer(s)</p>
                  {newQuestion.choices.map((choice, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        value={choice.choice_text}
                        onChange={(e) => {
                          const newChoices = [...newQuestion.choices];
                          newChoices[index].choice_text = e.target.value;
                          setNewQuestion({ ...newQuestion, choices: newChoices });
                        }}
                        className="flex-1 border rounded px-3 py-2"
                        placeholder={`Choice ${index + 1}`}
                      />
                      <label className="flex items-center gap-1 px-3 border rounded bg-white">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={choice.is_correct}
                          onChange={(_e) => {
                            const newChoices = newQuestion.choices.map((c, i) => ({
                              ...c,
                              is_correct: i === index
                            }));
                            setNewQuestion({ ...newQuestion, choices: newChoices });
                          }}
                        />
                        <span className="text-sm text-green-600 font-medium">Correct</span>
                      </label>
                      {newQuestion.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newChoices = newQuestion.choices.filter((_, i) => i !== index);
                            setNewQuestion({ ...newQuestion, choices: newChoices });
                          }}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setNewQuestion({
                        ...newQuestion,
                        choices: [
                          ...newQuestion.choices,
                          { choice_text: '', is_correct: false, order: newQuestion.choices.length }
                        ]
                      });
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add another choice
                  </button>
                </div>
              )}
              
              {newQuestion.question_type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Correct Answer *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="true_false"
                        checked={newQuestion.choices[0]?.is_correct === true}
                        onChange={() => setNewQuestion({
                          ...newQuestion,
                          choices: [
                            { choice_text: 'True', is_correct: true, order: 0 },
                            { choice_text: 'False', is_correct: false, order: 1 }
                          ]
                        })}
                      />
                      <span>True</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="true_false"
                        checked={newQuestion.choices[1]?.is_correct === true}
                        onChange={() => setNewQuestion({
                          ...newQuestion,
                          choices: [
                            { choice_text: 'True', is_correct: false, order: 0 },
                            { choice_text: 'False', is_correct: true, order: 1 }
                          ]
                        })}
                      />
                      <span>False</span>
                    </label>
                  </div>
                </div>
              )}
              
              {newQuestion.question_type === 'SHORT_ANSWER' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Identification/Short answer questions will need to be graded manually by you after students submit their answers.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={addQuestion} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddQuestion(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions yet. Add your first question!</p>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question_text} <span className="text-sm text-gray-500">({question.points} pts)</span>
                    </p>
                    {question.choices && (
                      <div className="ml-4 space-y-1">
                        {question.choices.map((choice) => (
                          <p key={choice.id} className={choice.is_correct ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            {choice.is_correct && '✓ '}{choice.choice_text}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditQuestion(question)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Question Modal */}
        {editingQuestion && editQuestion && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Edit Question</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select
                    value={editQuestion.question_type}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="SHORT_ANSWER">Identification / Short Answer</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Question type cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Question Text *</label>
                  <textarea
                    value={editQuestion.question_text}
                    onChange={(e) => setEditQuestion({ ...editQuestion, question_text: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Points *</label>
                  <input
                    type="number"
                    value={editQuestion.points}
                    onChange={(e) => setEditQuestion({ ...editQuestion, points: parseFloat(e.target.value) })}
                    className="border rounded px-3 py-2 w-32"
                    min="0.5"
                    step="0.5"
                  />
                </div>
                
                {editQuestion.question_type === 'MULTIPLE_CHOICE' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Answer Choices *</label>
                    {editQuestion.choices.map((choice: any, index: number) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={choice.choice_text}
                          onChange={(e) => {
                            const newChoices = [...editQuestion.choices];
                            newChoices[index].choice_text = e.target.value;
                            setEditQuestion({ ...editQuestion, choices: newChoices });
                          }}
                          className="flex-1 border rounded px-3 py-2"
                        />
                        <label className="flex items-center gap-1 px-3 border rounded bg-white">
                          <input
                            type="radio"
                            name="edit_correct_answer"
                            checked={choice.is_correct}
                            onChange={() => {
                              const newChoices = editQuestion.choices.map((c: any, i: number) => ({
                                ...c,
                                is_correct: i === index
                              }));
                              setEditQuestion({ ...editQuestion, choices: newChoices });
                            }}
                          />
                          <span className="text-sm text-green-600 font-medium">Correct</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {editQuestion.question_type === 'TRUE_FALSE' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Correct Answer *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="edit_true_false"
                          checked={editQuestion.choices[0]?.is_correct === true}
                          onChange={() => setEditQuestion({
                            ...editQuestion,
                            choices: [
                              { choice_text: 'True', is_correct: true, order: 0 },
                              { choice_text: 'False', is_correct: false, order: 1 }
                            ]
                          })}
                        />
                        <span>True</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="edit_true_false"
                          checked={editQuestion.choices[1]?.is_correct === true}
                          onChange={() => setEditQuestion({
                            ...editQuestion,
                            choices: [
                              { choice_text: 'True', is_correct: false, order: 0 },
                              { choice_text: 'False', is_correct: true, order: 1 }
                            ]
                          })}
                        />
                        <span>False</span>
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={updateQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setEditQuestion(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
