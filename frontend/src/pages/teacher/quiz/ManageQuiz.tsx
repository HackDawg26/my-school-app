'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Clock,
  Hash,
  Layers,
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

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

interface Choice {
  id?: number;
  choice_text: string;
  is_correct: boolean;
  order: number;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  choices: Choice[];
}

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
type StatusType = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED';

function fmtDT(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusMeta(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'OPEN')
    return { chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500', label: 'OPEN' };
  if (s === 'SCHEDULED')
    return { chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500', label: 'SCHEDULED' };
  if (s === 'CLOSED')
    return { chip: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200', dot: 'bg-slate-400', label: 'CLOSED' };
  return { chip: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200', dot: 'bg-indigo-500', label: 'DRAFT' };
}

function SkeletonLine({ w = 'w-full' }: { w?: string }) {
  return <div className={`h-3 ${w} rounded-full bg-slate-200/80 animate-pulse`} />;
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
            <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">{value}</div>
            <div className="mt-2 text-xs text-slate-500">{hint}</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
            {icon}
          </div>
        </div>
      </div>
      {/* <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-slate-100" /> */}
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b">
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</div>
            {subtitle ? <div className="mt-1 font-black text-slate-900 truncate">{subtitle}</div> : null}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-600"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function ManageQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingTimes, setSavingTimes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<{
    question_text: string;
    question_type: QuestionType;
    points: number;
    order: number;
    choices: Choice[];
  }>({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    points: 1,
    order: 0,
    choices: [
      { choice_text: '', is_correct: false, order: 0 },
      { choice_text: '', is_correct: false, order: 1 },
      { choice_text: '', is_correct: false, order: 2 },
      { choice_text: '', is_correct: false, order: 3 },
    ],
  });

  const [editingTimes, setEditingTimes] = useState(false);
  const [times, setTimes] = useState({ open_time: '', close_time: '' });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestion, setEditQuestion] = useState<any>(null);

  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<StatusType>('DRAFT');

  useEffect(() => {
    (async () => {
      await Promise.all([fetchQuiz(), fetchQuestions()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getToken = () => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).token : null;
  };

  const fetchQuiz = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuiz(response.data);
      setNewStatus((response.data.status || 'DRAFT').toUpperCase());

      // Convert UTC datetime to local datetime for datetime-local input
      const openDate = new Date(response.data.open_time);
      const closeDate = new Date(response.data.close_time);

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
      const token = getToken();
      const response = await axios.get(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/questions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  const updateTimes = async () => {
    try {
      const token = getToken();
      setSavingTimes(true);

      const openDate = new Date(times.open_time);
      const closeDate = new Date(times.close_time);

      await axios.patch(
        `http://127.0.0.1:8000/api/teacher/quizzes/${id}/update_times/`,
        { open_time: openDate.toISOString(), close_time: closeDate.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingTimes(false);
      await fetchQuiz();
    } catch (error: any) {
      console.error('Error updating times:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Failed to update times');
      }
    } finally {
      setSavingTimes(false);
    }
  };

  const updateStatus = async () => {
    try {
      const token = getToken();
      setSavingStatus(true);

      await axios.patch(
        `http://127.0.0.1:8000/api/teacher/quizzes/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingStatus(false);
      await fetchQuiz();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const addQuestion = async () => {
    try {
      const token = getToken();

      let questionData: any = {
        ...newQuestion,
        order: questions.length,
      };

      if (newQuestion.question_type === 'MULTIPLE_CHOICE') {
        questionData.choices = newQuestion.choices;
      }

      if (newQuestion.question_type === 'TRUE_FALSE') {
        const isTrueCorrect = newQuestion.choices[0]?.is_correct || false;
        questionData.choices = [
          { choice_text: 'True', is_correct: isTrueCorrect, order: 0 },
          { choice_text: 'False', is_correct: !isTrueCorrect, order: 1 },
        ];
      }

      await axios.post(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/add_question/`, questionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddQuestion(false);
      await fetchQuestions();

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
        ],
      });
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (!confirm('Delete this question?')) return;

    try {
      const token = getToken();
      await axios.delete(`http://127.0.0.1:8000/api/teacher/questions/${questionId}/`, {
        headers: { Authorization: `Bearer ${token}` },
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
      choices: question.choices || [],
    });
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const token = getToken();
      setSavingQuestion(true);

      let questionData: any = { ...editQuestion };

      // TRUE_FALSE: keep IDs
      if (editQuestion.question_type === 'TRUE_FALSE') {
        const existingChoices = editQuestion.choices || [];
        const trueChoice = existingChoices.find((c: any) => c.choice_text === 'True') || existingChoices[0];
        const falseChoice = existingChoices.find((c: any) => c.choice_text === 'False') || existingChoices[1];

        const isTrueCorrect = trueChoice?.is_correct || false;

        questionData.choices = [
          { id: trueChoice?.id, choice_text: 'True', is_correct: isTrueCorrect, order: 0 },
          { id: falseChoice?.id, choice_text: 'False', is_correct: !isTrueCorrect, order: 1 },
        ];
      }

      await axios.put(`http://127.0.0.1:8000/api/teacher/questions/${editingQuestion.id}/`, questionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditingQuestion(null);
      setEditQuestion(null);
      await fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const totals = useMemo(() => {
    const qCount = questions.length;
    const points = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const mc = questions.filter((q) => q.question_type === 'MULTIPLE_CHOICE').length;
    const tf = questions.filter((q) => q.question_type === 'TRUE_FALSE').length;
    const sa = questions.filter((q) => q.question_type === 'SHORT_ANSWER').length;
    return { qCount, points, mc, tf, sa };
  }, [questions]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
          <div className="h-9 w-64 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse" />
            <div className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse" />
            <div className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse" />
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <SkeletonLine w="w-52" />
            <div className="mt-4 space-y-3">
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <div className="rounded-3xl border border-rose-200 bg-white p-6">
            <div className="text-sm font-black uppercase tracking-widest text-rose-500">Error</div>
            <div className="mt-2 text-lg font-bold text-slate-900">Quiz not found</div>
            <div className="mt-1 text-sm text-slate-500">Go back and try again.</div>
            <button
              onClick={() => navigate('/teacher/activities')}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600"
            >
              <ArrowLeft size={16} />
              Back to Activities
            </button>
          </div>
        </div>
      </main>
    );
  }

  const chip = statusMeta(quiz.status);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/activities')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Manage Activity</div>
              <h1 className="truncate text-xl md:text-2xl font-black tracking-tight text-slate-900">{quiz.title}</h1>
              <div className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {quiz.subject_name} • Quiz ID: {quiz.quiz_id}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link
                to={`/teacher/activities/${id}/item-analysis`}
                className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 size={16} />
                Item Analysis
              </Link>

              <Link
                to={`/teacher/activities/${id}/grading`}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 transition"
              >
                <Pencil size={16} />
                Manual Grading
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setActiveTab('questions')}
              className={[
                'rounded-2xl px-4 py-2.5 text-sm font-black transition border',
                activeTab === 'questions'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-2">
                <Layers size={16} />
                Questions
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={[
                'rounded-2xl px-4 py-2.5 text-sm font-black transition border',
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-2">
                <CalendarClock size={16} />
                Schedule & Status
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto  px-4 md:px-6 py-6 md:py-10">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<ClipboardList size={18} />} label="Questions" value={<span>{totals.qCount}</span>} hint="Total items" />
          <StatCard icon={<Hash size={18} />} label="Points" value={<span>{totals.points}</span>} hint="Sum of points" />
          <StatCard icon={<Clock size={18} />} label="Time Limit" value={<span>{quiz.time_limit}m</span>} hint="Per attempt" />
          <StatCard
            icon={<Sparkles size={18} />}
            label="Status"
            value={
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-black ${chip.chip}`}>
                <span className={`h-2 w-2 rounded-full ${chip.dot}`} />
                {chip.label}
              </span>
            }
            hint="Student visibility"
          />
        </div>

        {/* Main card */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Workspace</div>
                <div className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  {activeTab === 'questions' ? 'Questions' : 'Schedule & Status'}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {activeTab === 'questions'
                    ? 'Create, edit, and review quiz items.'
                    : 'Control quiz visibility and open/close times.'}
                </div>
              </div>

              {activeTab === 'questions' ? (
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 transition"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              ) : null}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* QUESTIONS TAB */}
            {activeTab === 'questions' && (
              <>
                {questions.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">No questions yet</div>
                        <div className="mt-1 text-sm text-slate-600">Add your first question to start building the quiz.</div>
                        <button
                          onClick={() => setShowAddQuestion(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600"
                        >
                          <Plus size={16} />
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                      {questions
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((question, idx) => (
                          <div key={question.id} className="p-5 hover:bg-slate-50 transition">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-black text-slate-500">#{idx + 1}</div>
                                  <div className="font-black text-slate-900">{question.question_text}</div>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-black">
                                    {question.question_type.replace('_', ' ')}
                                  </span>
                                  <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-black">
                                    {question.points} pt{Number(question.points) === 1 ? '' : 's'}
                                  </span>
                                </div>

                                {question.choices?.length ? (
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {question.choices
                                      .slice()
                                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                      .map((choice) => (
                                        <div
                                          key={choice.id ?? `${choice.choice_text}-${choice.order}`}
                                          className={[
                                            'rounded-2xl border px-3 py-2 text-sm',
                                            choice.is_correct
                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                              : 'border-slate-200 bg-white text-slate-700',
                                          ].join(' ')}
                                        >
                                          <div className="flex items-center gap-2">
                                            {choice.is_correct ? (
                                              <CheckCircle2 size={16} className="text-emerald-600" />
                                            ) : (
                                              <span className="h-4 w-4 rounded-full border border-slate-300" />
                                            )}
                                            <span className="font-semibold">{choice.choice_text}</span>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="mt-3 text-sm text-slate-500">
                                    No choices (manual grading / short answer).
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEditQuestion(question)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil size={16} />
                                  Edit
                                </button>

                                <button
                                  onClick={() => deleteQuestion(question.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 hover:bg-rose-100"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Status */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-black ${chip.chip}`}>
                      <span className={`h-2 w-2 rounded-full ${chip.dot}`} />
                      {chip.label}
                    </span>

                    {!editingStatus ? (
                      <button
                        onClick={() => setEditingStatus(true)}
                        className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Change
                      </button>
                    ) : null}
                  </div>

                  {!editingStatus ? (
                    <div className="mt-3 text-sm text-slate-600">
                      DRAFT hides it from students. SCHEDULED shows it. OPEN forces it open. CLOSED locks it.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as StatusType)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="DRAFT">Draft (Hidden from students)</option>
                        <option value="SCHEDULED">Scheduled (Visible to students)</option>
                        <option value="OPEN">Open (Force open now)</option>
                        <option value="CLOSED">Closed (Force closed)</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={updateStatus}
                          disabled={savingStatus}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 disabled:opacity-60"
                        >
                          <Save size={16} />
                          {savingStatus ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingStatus(false);
                            setNewStatus((quiz.status || 'DRAFT').toUpperCase() as StatusType);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Times */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Schedule</div>

                  {!editingTimes ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Open</span>
                        <span className="font-bold">{fmtDT(quiz.open_time)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Close</span>
                        <span className="font-bold">{fmtDT(quiz.close_time)}</span>
                      </div>

                      <button
                        onClick={() => setEditingTimes(true)}
                        className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Change Times
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                          Open Time
                        </label>
                        <input
                          type="datetime-local"
                          value={times.open_time}
                          onChange={(e) => setTimes({ ...times, open_time: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                          Close Time
                        </label>
                        <input
                          type="datetime-local"
                          value={times.close_time}
                          onChange={(e) => setTimes({ ...times, close_time: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={updateTimes}
                          disabled={savingTimes}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 disabled:opacity-60"
                        >
                          <Save size={16} />
                          {savingTimes ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingTimes(false)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD QUESTION MODAL */}
      {showAddQuestion && (
        <ModalShell title="Add Question" subtitle="Create a new item for this quiz" onClose={() => setShowAddQuestion(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Question Type
              </label>
              <select
                value={newQuestion.question_type}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_type: e.target.value as QuestionType,
                    choices:
                      e.target.value === 'MULTIPLE_CHOICE'
                        ? [
                            { choice_text: '', is_correct: false, order: 0 },
                            { choice_text: '', is_correct: false, order: 1 },
                            { choice_text: '', is_correct: false, order: 2 },
                            { choice_text: '', is_correct: false, order: 3 },
                          ]
                        : [],
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT_ANSWER">Identification / Short Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Question Text
              </label>
              <textarea
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Enter your question…"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseFloat(e.target.value) })}
                  min={0.5}
                  step={0.5}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-black text-slate-900">Heads up</div>
                <div className="mt-1 text-sm text-slate-600">
                  Short answer items require manual grading after submission.
                </div>
              </div>
            </div>

            {newQuestion.question_type === 'MULTIPLE_CHOICE' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-900">Choices</div>
                    <div className="text-xs text-slate-500">Mark exactly one correct answer.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestion({
                        ...newQuestion,
                        choices: [...newQuestion.choices, { choice_text: '', is_correct: false, order: newQuestion.choices.length }],
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    <Plus size={16} />
                    Add Choice
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {newQuestion.choices.map((choice, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-2">
                      <input
                        type="text"
                        value={choice.choice_text}
                        onChange={(e) => {
                          const next = [...newQuestion.choices];
                          next[index].choice_text = e.target.value;
                          setNewQuestion({ ...newQuestion, choices: next });
                        }}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Choice ${index + 1}`}
                      />

                      <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700">
                        <input
                          type="radio"
                          name="new_correct"
                          checked={choice.is_correct}
                          onChange={() => {
                            const next = newQuestion.choices.map((c, i) => ({ ...c, is_correct: i === index }));
                            setNewQuestion({ ...newQuestion, choices: next });
                          }}
                        />
                        Correct
                      </label>

                      {newQuestion.choices.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const next = newQuestion.choices.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i }));
                            setNewQuestion({ ...newQuestion, choices: next });
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-black text-rose-700 hover:bg-rose-100"
                          title="Remove choice"
                        >
                          <X size={16} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newQuestion.question_type === 'TRUE_FALSE' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-black text-slate-900">Correct Answer</div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestion({
                        ...newQuestion,
                        choices: [
                          { choice_text: 'True', is_correct: true, order: 0 },
                          { choice_text: 'False', is_correct: false, order: 1 },
                        ],
                      })
                    }
                    className={[
                      'flex-1 rounded-2xl px-4 py-3 text-sm font-black border transition',
                      newQuestion.choices[0]?.is_correct ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    True
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestion({
                        ...newQuestion,
                        choices: [
                          { choice_text: 'True', is_correct: false, order: 0 },
                          { choice_text: 'False', is_correct: true, order: 1 },
                        ],
                      })
                    }
                    className={[
                      'flex-1 rounded-2xl px-4 py-3 text-sm font-black border transition',
                      newQuestion.choices[1]?.is_correct ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    False
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600"
              >
                <Plus size={16} />
                Add Question
              </button>
              <button
                type="button"
                onClick={() => setShowAddQuestion(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && editQuestion && (
        <ModalShell title="Edit Question" subtitle={`Question #${(editingQuestion.order ?? 0) + 1}`} onClose={() => { setEditingQuestion(null); setEditQuestion(null); }}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-900">Question Type</div>
              <div className="mt-1 text-sm text-slate-700">{editQuestion.question_type.replace('_', ' ')}</div>
              <div className="mt-1 text-xs text-slate-500">Question type cannot be changed.</div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Question Text
              </label>
              <textarea
                value={editQuestion.question_text}
                onChange={(e) => setEditQuestion({ ...editQuestion, question_text: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Points
              </label>
              <input
                type="number"
                value={editQuestion.points}
                onChange={(e) => setEditQuestion({ ...editQuestion, points: parseFloat(e.target.value) })}
                min={0.5}
                step={0.5}
                className="w-full md:w-52 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {editQuestion.question_type === 'MULTIPLE_CHOICE' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-black text-slate-900">Choices</div>
                <div className="mt-3 space-y-2">
                  {editQuestion.choices.map((choice: any, index: number) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-2">
                      <input
                        type="text"
                        value={choice.choice_text}
                        onChange={(e) => {
                          const newChoices = [...editQuestion.choices];
                          newChoices[index].choice_text = e.target.value;
                          setEditQuestion({ ...editQuestion, choices: newChoices });
                        }}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700">
                        <input
                          type="radio"
                          name="edit_correct"
                          checked={choice.is_correct}
                          onChange={() => {
                            const newChoices = editQuestion.choices.map((c: any, i: number) => ({ ...c, is_correct: i === index }));
                            setEditQuestion({ ...editQuestion, choices: newChoices });
                          }}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editQuestion.question_type === 'TRUE_FALSE' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-black text-slate-900">Correct Answer</div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const choices = [...(editQuestion.choices || [])];
                      choices[0] = { ...choices[0], choice_text: 'True', is_correct: true, order: 0 };
                      choices[1] = { ...choices[1], choice_text: 'False', is_correct: false, order: 1 };
                      setEditQuestion({ ...editQuestion, choices });
                    }}
                    className={[
                      'flex-1 rounded-2xl px-4 py-3 text-sm font-black border transition',
                      editQuestion.choices[0]?.is_correct ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    True
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const choices = [...(editQuestion.choices || [])];
                      choices[0] = { ...choices[0], choice_text: 'True', is_correct: false, order: 0 };
                      choices[1] = { ...choices[1], choice_text: 'False', is_correct: true, order: 1 };
                      setEditQuestion({ ...editQuestion, choices });
                    }}
                    className={[
                      'flex-1 rounded-2xl px-4 py-3 text-sm font-black border transition',
                      editQuestion.choices[1]?.is_correct ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    False
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={updateQuestion}
                disabled={savingQuestion}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 disabled:opacity-60"
              >
                <Save size={16} />
                {savingQuestion ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setEditQuestion(null);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </main>
  );
}
