'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../lib/api';
import {
  ArrowLeft,
  Users,
  ClipboardCheck,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Edit3,
  X,
  CalendarClock,
} from 'lucide-react';

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
    </div>
  );
}

function formatDT(iso?: string | null) {
  if (!iso) return '—';
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

function clampNum(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function statusChip(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'GRADED') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (s === 'SUBMITTED') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
}

function answerPerfMeta(answer: StudentAnswer) {
  // If it's auto-gradable (is_correct not null), show correctness
  if (answer.is_correct === true) {
    return { icon: <CheckCircle2 size={16} className="text-emerald-600" />, label: 'Correct', chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
  }
  if (answer.is_correct === false) {
    return { icon: <XCircle size={16} className="text-rose-600" />, label: 'Incorrect', chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' };
  }
  // Manual/subjective
  if (answer.manually_graded) {
    return { icon: <CheckCircle2 size={16} className="text-emerald-600" />, label: 'Graded', chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
  }
  return { icon: <AlertTriangle size={16} className="text-amber-600" />, label: 'Needs grading', chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
}

export default function QuizGradingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const token = localStorage.getItem('access');

      const quizRes = await authFetch(`/api/teacher/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const quizData = await quizRes.json();
      setQuiz(quizData);

      const answersRes = await authFetch(`/api/teacher/quizzes/${id}/student_answers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const answersData = await answersRes.json();
      setSubmissions(Array.isArray(answersData) ? answersData : []);

      if (Array.isArray(answersData) && answersData.length > 0) {
        setSelectedStudent((prev) => {
          // keep same student selected if still exists
          if (prev) {
            const stillThere = answersData.find((s: StudentSubmission) => s.attempt_id === prev.attempt_id);
            return stillThere ?? answersData[0];
          }
          return answersData[0];
        });
      } else {
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      setErrorMsg('Failed to load quiz grading data.');
    } finally {
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer_id: answerId,
          points_earned: points,
          feedback,
        }),
      });

      if (response.ok) {
        await fetchQuizData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Failed to grade answer'}`);
      }
    } catch (error) {
      console.error('Error grading answer:', error);
      alert('Failed to grade answer');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((s) => (s.status || '').toUpperCase() === 'GRADED').length;
    const pending = total - graded;
    return { total, graded, pending };
  }, [submissions]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 rounded-2xl bg-white border border-slate-200 shadow-sm" />
            <div className="flex-1">
              <div className="h-8 w-72 rounded-2xl bg-slate-200/80 animate-pulse" />
              <div className="mt-2 h-3 w-52 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-40" />
              <div className="mt-5">
                <SkeletonLine w="w-20" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-40" />
              <div className="mt-5">
                <SkeletonLine w="w-24" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-40" />
              <div className="mt-5">
                <SkeletonLine w="w-24" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-32" />
              <div className="mt-4 space-y-3">
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-48" />
              <div className="mt-4 space-y-3">
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mt-6 rounded-3xl border border-rose-200 bg-white p-6">
            <div className="text-sm font-black uppercase tracking-widest text-rose-500">Error</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{errorMsg}</div>
            <div className="mt-1 text-sm text-slate-500">Try refreshing the page.</div>
            <button
              onClick={fetchQuizData}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600"
            >
              <ClipboardCheck size={16} />
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Manual Grading</div>
              <h1 className="truncate text-xl md:text-2xl font-black tracking-tight text-slate-900">
                {quiz?.title ?? 'Quiz'}
              </h1>
              <div className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Total Points: {quiz?.total_points ?? '—'} • Submissions: {submissions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto  px-4 md:px-6 py-6 md:py-10">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Users size={18} />} label="Submissions" value={<span>{stats.total}</span>} hint="Total attempts" />
          <StatCard icon={<CheckCircle2 size={18} />} label="Graded" value={<span>{stats.graded}</span>} hint="Marked as graded" />
          <StatCard icon={<AlertTriangle size={18} />} label="Pending" value={<span>{stats.pending}</span>} hint="Needs review" />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Student list */}
          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Students</div>
                <div className="mt-1 text-lg font-black text-slate-900">Select submission</div>
              </div>

              <div className="max-h-[70vh] overflow-auto p-3 space-y-2">
                {submissions.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No submissions yet.
                  </div>
                ) : (
                  submissions.map((s) => {
                    const active = selectedStudent?.attempt_id === s.attempt_id;
                    return (
                      <button
                        key={s.attempt_id}
                        onClick={() => setSelectedStudent(s)}
                        className={[
                          'w-full text-left rounded-2xl border p-4 transition',
                          active
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-black truncate">{s.student_name}</div>
                            <div className={`mt-1 text-xs ${active ? 'text-white/80' : 'text-slate-500'}`}>
                              Score: {(s.score ?? 0).toFixed(1)} / {quiz?.total_points ?? '—'}
                            </div>
                          </div>

                          <span
                            className={[
                              'shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-black',
                              active ? 'bg-white/15 text-white' : statusChip(s.status),
                            ].join(' ')}
                          >
                            {(s.status || '—').toUpperCase()}
                          </span>
                        </div>

                        <div className={`mt-2 flex items-center gap-2 text-xs ${active ? 'text-white/75' : 'text-slate-500'}`}>
                          <CalendarClock size={14} />
                          <span className="truncate">Submitted: {formatDT(s.submitted_at)}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Grading panel */}
          <section className="lg:col-span-3">
            {!selectedStudent ? (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="text-sm font-black text-slate-900">Select a student</div>
                <div className="mt-1 text-sm text-slate-600">Choose a submission from the left to view answers.</div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Selected</div>
                      <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                        {selectedStudent.student_name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{selectedStudent.student_email}</div>
                      <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        Submitted: {formatDT(selectedStudent.submitted_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Total Score
                        </div>
                        <div className="mt-1 text-xl font-black text-slate-900">
                          {(selectedStudent.score ?? 0).toFixed(1)}{' '}
                          <span className="text-sm font-black text-slate-400">/ {quiz?.total_points ?? '—'}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-2 text-[11px] font-black ${statusChip(selectedStudent.status)}`}>
                        {(selectedStudent.status || '—').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* answers */}
                <div className="p-6 space-y-4">
                  {selectedStudent.answers.map((answer, idx) => (
                    <AnswerGradingCard
                      key={answer.id}
                      answer={answer}
                      index={idx}
                      onGrade={handleGradeAnswer}
                      saving={saving}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

interface AnswerGradingCardProps {
  answer: StudentAnswer;
  index: number;
  onGrade: (answerId: number, points: number, feedback: string) => Promise<void>;
  saving: boolean;
}

function AnswerGradingCard({ answer, index, onGrade, saving }: AnswerGradingCardProps) {
  const [points, setPoints] = useState(String(answer.points_earned ?? 0));
  const [feedback, setFeedback] = useState(answer.teacher_feedback || '');
  const [isEditing, setIsEditing] = useState(!answer.manually_graded); // open editor by default if not graded

  const meta = useMemo(() => answerPerfMeta(answer), [answer]);

  const pointsNum = useMemo(() => {
    const n = parseFloat(points);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [points]);

  const overMax = pointsNum > (answer.question_points ?? 0);

  const canSave = !saving && !overMax && pointsNum >= 0;

  const resetToSaved = () => {
    setPoints(String(answer.points_earned ?? 0));
    setFeedback(answer.teacher_feedback || '');
  };

  const handleSubmit = async () => {
    const max = answer.question_points ?? 0;
    const safe = clampNum(pointsNum, 0, max);
    await onGrade(answer.id, safe, feedback);
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      {/* top */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${meta.chip}`}>
                {meta.icon}
                {meta.label}
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Question {index + 1}
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Worth {answer.question_points} pt{answer.question_points !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-2 text-sm font-bold text-slate-900">{answer.question_text}</div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Points</div>
                <div className="mt-0.5 text-lg font-black text-slate-900">
                  {answer.points_earned} <span className="text-sm font-black text-slate-400">/ {answer.question_points}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <Edit3 size={16} />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* student answer */}
      <div className="p-5 bg-slate-50 border-b border-slate-100">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Student Answer</div>

        {answer.text_answer ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-wrap">
            {answer.text_answer}
          </div>
        ) : null}

        {answer.selected_choice ? (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <div className="font-bold">Selected Choice ID</div>
              <div className="font-black text-slate-900">{answer.selected_choice}</div>
            </div>
            {answer.is_correct !== null ? (
              <div className="mt-2">
                <span
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black',
                    answer.is_correct
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
                  ].join(' ')}
                >
                  {answer.is_correct ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-rose-600" />}
                  {answer.is_correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {answer.answer_file_url ? (
          <div className="mt-3">
            <a
              href={`http://127.0.0.1:8000${answer.answer_file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              title="Open uploaded file"
            >
              <Paperclip size={16} />
              View uploaded file
            </a>
          </div>
        ) : null}

        {!answer.text_answer && !answer.selected_choice && !answer.answer_file_url ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No answer content.
          </div>
        ) : null}
      </div>

      {/* grading */}
      <div className="p-5">
        {!isEditing && answer.manually_graded ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Teacher Feedback</div>
              {answer.graded_at ? (
                <div className="text-xs text-slate-500">
                  Graded {formatDT(answer.graded_at)} {answer.graded_by_name ? `• ${answer.graded_by_name}` : ''}
                </div>
              ) : null}
            </div>

            {answer.teacher_feedback ? (
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {answer.teacher_feedback}
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">No feedback provided.</div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Points Earned (max {answer.question_points})
              </div>
              <div className="mt-2 relative">
                <input
                  type="number"
                  min={0}
                  max={answer.question_points}
                  step="0.5"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none',
                    overMax ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500',
                  ].join(' ')}
                  disabled={saving}
                />
                <div className="mt-2 text-xs text-slate-500">
                  {overMax ? (
                    <span className="text-rose-600 font-bold">Points cannot exceed max.</span>
                  ) : (
                    <span>Use 0.5 steps if needed.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Feedback (optional)</div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write feedback to the student..."
                disabled={saving}
              />
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-end gap-2 pt-1">
              {answer.manually_graded ? (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    resetToSaved();
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <X size={16} />
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => {
                    // for ungraded, collapse editor but keep values
                    setIsEditing(false);
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <X size={16} />
                  Close
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSave}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-white transition',
                  canSave ? 'bg-slate-900 hover:bg-indigo-600' : 'bg-slate-300 cursor-not-allowed',
                ].join(' ')}
              >
                <Save size={16} />
                {saving ? 'Saving…' : 'Save Grade'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
