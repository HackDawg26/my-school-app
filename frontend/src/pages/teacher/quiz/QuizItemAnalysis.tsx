'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
  Users,
  Percent,
} from 'lucide-react';

interface ChoiceDistribution {
  [choiceText: string]: {
    count: number;
    percentage: number;
    is_correct: boolean;
  };
}

interface ScoreBin{
  score: number;
  count: number;
  percentage: number;
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

  ungraded_count: number;
  analysis_mode?: 'CHOICES' | 'SCORES' | 'N/A';
  graded_count?: number;
  pending_count?: number;
  max_points?: number;
  avg_score?: number | null;
  score_distribution?: ScoreBin[];
}

interface ItemAnalysisData {
  quiz_id: number;
  quiz_title: string;
  total_questions: number;
  total_student_attempts: number;
  questions: QuestionAnalysis[];
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

function statusMetaFromPct(pct: number) {
  if (pct >= 75) {
    return {
      icon: <CheckCircle2 className="text-emerald-600" size={18} />,
      chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      label: 'STRONG',
      tip: 'Well understood',
    };
  }
  if (pct >= 50) {
    return {
      icon: <AlertTriangle className="text-amber-600" size={18} />,
      chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      label: 'NEEDS REVIEW',
      tip: 'Mixed results',
    };
  }
  return {
    icon: <XCircle className="text-rose-600" size={18} />,
    chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    label: 'DIFFICULT',
    tip: 'Most students struggled',
  };
}

function pendingMeta(pending: number) {
  if (pending > 0) {
    return {
      icon: <AlertTriangle className="text-amber-600" size={18} />,
      chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      label: 'PENDING GRADING',
      tip: 'Some answers still need manual grading',
    };
  }
  return null;
}


function difficultyChip(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case 'Hard':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200';
    case 'Very Hard':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
  }
}

function pct(n: number) {
  if (!Number.isFinite(n)) return '0.0';
  return n.toFixed(1);
}

export default function QuizItemAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ItemAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchItemAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItemAnalysis = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;

      const response = await axios.get(`http://127.0.0.1:8000/api/teacher/quizzes/${id}/item-analysis/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(response.data);
    } catch (error) {
      console.error('Error fetching item analysis:', error);
      setErrorMsg('Failed to load item analysis');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const avgSuccess = useMemo(() => {
    if (!data?.questions?.length) return 0;

    const vals = data.questions.map((q) => {
      if (q.analysis_mode === 'SCORES') {
        const max = q.max_points ?? q.points ?? 0;
        const avg = q.avg_score ?? 0;
        return max > 0 ? (avg / max) * 100 : 0;
      }
      return q.correct_percentage || 0;
    });

    const sum = vals.reduce((a, b) => a + b, 0);
    return sum / vals.length;
  }, [data]);


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-2xl bg-white border border-slate-200 shadow-sm" />
            <div className="flex-1">
              <div className="h-8 w-72 rounded-2xl bg-slate-200/80 animate-pulse" />
              <div className="mt-2 h-3 w-40 rounded-full bg-slate-200/80 animate-pulse" />
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
                <SkeletonLine w="w-28" />
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

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <SkeletonLine w="w-64" />
            <div className="mt-4 space-y-3">
              <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data || errorMsg) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <button
            onClick={() => navigate(`/teacher/activities/${id}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mt-6 rounded-3xl border border-rose-200 bg-white p-6">
            <div className="text-sm font-black uppercase tracking-widest text-rose-500">Error</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{errorMsg ?? 'Failed to load item analysis'}</div>
            <div className="mt-1 text-sm text-slate-500">Try refreshing the page.</div>
            <button
              onClick={fetchItemAnalysis}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600"
            >
              <BarChart3 size={16} />
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
        <div className="mx-auto  px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/teacher/activities/${id}`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Item Analysis</div>
              <h1 className="truncate text-xl md:text-2xl font-black tracking-tight text-slate-900">
                {data.quiz_title}
              </h1>
              <div className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Report • Quiz #{data.quiz_id}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-4 md:px-6 py-6 md:py-10">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Layers size={18} />} label="Total Questions" value={<span>{data.total_questions}</span>} hint="Number of items" />
          <StatCard icon={<Users size={18} />} label="Student Attempts" value={<span>{data.total_student_attempts}</span>} hint="Total submissions" />
          <StatCard
            icon={<Percent size={18} />}
            label="Avg Success"
            value={<span>{pct(avgSuccess)}%</span>}
            hint="Mean correct percentage"
          />
        </div>

        {/* No attempts */}
        {data.total_student_attempts === 0 && (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/70 border border-amber-200 flex items-center justify-center text-amber-700">
                <Info size={18} />
              </div>
              <div>
                <div className="font-black text-amber-900">No student attempts yet</div>
                <div className="mt-1 text-sm text-amber-800">
                  Item analysis will populate after students complete the quiz.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Question-by-question
              </div>
              <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Detailed Breakdown
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                See success rate, difficulty, and choice selection for each item.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {data.questions.map((question, index) => {
              const diffChip = difficultyChip(question.difficulty);
              const pending =
                question.pending_count ??
                question.ungraded_count ??
                0;
              const maybePendingMeta = pendingMeta(pending);
              const isScores = question.analysis_mode === 'SCORES';
              const successPct = isScores
                ? (() => {
                    const max = question.max_points ?? question.points ?? 0;
                    const avg = question.avg_score ?? 0;
                    return max > 0 ? (avg / max) * 100 : 0;
                  })()
                : (question.correct_percentage || 0);
              const perf = maybePendingMeta ?? statusMetaFromPct(successPct);
              const distEntries = Object.entries(question.choice_distribution || {});
              const hasChoiceDist = !isScores && question.total_attempts > 0 && distEntries.length > 0;
              const scoreEntries = question.score_distribution || [];
              const hasScoreDist = isScores && scoreEntries.length > 0;


              return (
                <div key={question.question_id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* header */}
                  <div className="p-5 md:p-6 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {perf.icon}
                          <div className="font-black text-slate-900">
                            Question {index + 1}
                            <span className="ml-2 text-sm text-slate-500 font-bold">
                              ({question.points} pt{question.points !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <span className={`ml-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${diffChip}`}>
                            {question.difficulty}
                          </span>
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${perf.chip}`}>
                            {perf.label}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-slate-700">{question.question_text}</div>
                        <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          Type: {question.question_type.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {isScores ? 'Avg Score %' : 'Success'}
                          </div>
                          <div className="mt-1 text-xl font-black text-slate-900">{pct(successPct)}%</div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* stats */}
                  <div className="p-5 md:p-6">
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Attempts</div>
                        <div className="mt-1 text-2xl font-black text-slate-900">{question.total_attempts}</div>
                      </div>

                      {isScores ? (
                        <>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700/70">Graded</div>
                            <div className="mt-1 text-2xl font-black text-emerald-800">{question.graded_count ?? 0}</div>
                          </div>

                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700/70">Pending</div>
                            <div className="mt-1 text-2xl font-black text-amber-800">{pending}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700/70">Correct</div>
                            <div className="mt-1 text-2xl font-black text-emerald-800">{question.correct_count}</div>
                          </div>

                          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-700/70">Incorrect</div>
                            <div className="mt-1 text-2xl font-black text-rose-800">{question.incorrect_count}</div>
                          </div>
                        </>
                      )}

                      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700/70">Tip</div>
                        <div className="mt-1 text-sm font-bold text-indigo-800">{perf.tip}</div>
                      </div>
                    </div>


                    {/* distribution */}
                    {hasChoiceDist ? (
                      <div className="mt-6">
                        <div className="text-sm font-black text-slate-900">Answer Choice Distribution</div>
                        <div className="mt-3 space-y-3">
                          {distEntries.map(([choiceText, stats]) => (
                            <div key={choiceText} className="rounded-2xl border border-slate-200 bg-white p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className={`font-bold ${stats.is_correct ? 'text-emerald-700' : 'text-slate-800'} truncate`}>
                                    {stats.is_correct ? '✓ ' : ''}
                                    {choiceText}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    {stats.count} response{stats.count !== 1 ? 's' : ''} • {pct(stats.percentage)}%
                                  </div>
                                </div>
                                <div className={`text-xs font-black ${stats.is_correct ? 'text-emerald-700' : 'text-slate-600'}`}>
                                  {pct(stats.percentage)}%
                                </div>
                              </div>

                              <div className="mt-3 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={stats.is_correct ? 'h-full bg-emerald-500' : 'h-full bg-slate-400'}
                                  style={{ width: `${Math.max(0, Math.min(100, stats.percentage))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {isScores ? (
                      <div className="mt-6">
                        <div className="flex items-end justify-between gap-3">
                          <div className="text-sm font-black text-slate-900">Score Distribution</div>
                          <div className="text-xs font-bold text-slate-500">
                            Avg: {(question.avg_score ?? 0).toFixed(2)} / {(question.max_points ?? question.points ?? 0).toFixed(1)}
                          </div>
                        </div>

                        {pending > 0 ? (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            {pending} answer(s) still need manual grading. Distribution reflects graded answers only.
                          </div>
                        ) : null}

                        {hasScoreDist ? (
                          <div className="mt-3 space-y-3">
                            {scoreEntries.map((b) => (
                              <div key={String(b.score)} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-bold text-slate-800">
                                    {b.score} / {(question.max_points ?? question.points ?? 0).toFixed(1)}
                                  </div>
                                  <div className="text-xs font-black text-slate-600">{pct(b.percentage)}%</div>
                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  {b.count} student{b.count !== 1 ? 's' : ''}
                                </div>

                                <div className="mt-3 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500"
                                    style={{ width: `${Math.max(0, Math.min(100, b.percentage))}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            No graded responses yet.
                          </div>
                        )}
                      </div>
                    ) : null}


                    {/* recommendations */}
                    {question.total_attempts > 0 ? (
                      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-black text-slate-900">Recommendations</div>
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {successPct < 50 && (
                            <li>• This item is difficult for most students — consider reteaching or adding guided practice.</li>
                          )}
                          {successPct >= 75 && (
                            <li>• Students performed well — concept appears well understood.</li>
                          )}

                          {question.question_type === 'MULTIPLE_CHOICE' &&
                            Object.values(question.choice_distribution || {}).some((s) => !s.is_correct && s.percentage > 30) && (
                              <li>• A distractor has a high pick rate — review misconceptions tied to that option.</li>
                            )}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
