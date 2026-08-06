'use client';

import { useStudentProfile } from '../../../hooks/useStudentProfile';
import StatCard from '../../../components/studentcomponents/StatCard'

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Layers,
  Search,
} from 'lucide-react';

// ---------------- Types ----------------

type SubjectOfferingCard = {
  id: number;
  subject_name: string;
  teacher_name?: string;
  progress?: number; // 0..100
  average?: number;  // 0..100
  final_grade?: number | null;
};

type QuizStatus = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED';

type Quiz = {
  id: number;
  title: string;
  open_time?: string | null;
  close_time?: string | null;
  status?: QuizStatus;
  SubjectOffering?: number;
  subject_name?: string; // StudentQuizSerializer returns this
  allow_multiple_attempts?: boolean;
  user_attempts?: number;
  is_open?: boolean;
  is_upcoming?: boolean;
  is_closed?: boolean;
};

// ---------------- Helpers ----------------

function safeNumber(v: any, fallback = 0) {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
}


function dueIso(q: Quiz) {
  return q.close_time ?? q.open_time ?? null;
}

function urgencyFromDate(iso?: string | null) {
  if (!iso) return 'low' as const;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'low' as const;
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 'high' as const;
  if (diffDays <= 3) return 'medium' as const;
  return 'low' as const;
}

function canTakeQuiz(q: Quiz) {
  const isOpen = q.is_open ?? q.status === 'OPEN';
  if (!isOpen) return false;

  const allow = q.allow_multiple_attempts ?? true;
  const attempts = safeNumber(q.user_attempts, 0);
  if (!allow && attempts > 0) return false;

  return true;
}

function StatusPill({ status }: { status?: QuizStatus }) {
  const s = status ?? 'SCHEDULED';
  const cls =
    s === 'OPEN'
      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
      : s === 'CLOSED'
      ? 'bg-slate-50 border-slate-200 text-slate-500'
      : s === 'SCHEDULED'
      ? 'bg-amber-50 border-amber-100 text-amber-700'
      : 'bg-slate-50 border-slate-200 text-slate-500';

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cls}`}>
      {s}
    </span>
  );
}



function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${v}%` }} />
    </div>
  );
}

// ---------------- Component ----------------

export default function StudentDashboard() {

  const { 
    data: student,
    isLoading,
    error
  } = useStudentProfile();

  const [offerings, setOfferings] = useState<SubjectOfferingCard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI state
  const [qSearch, setQSearch] = useState('');

  const token = localStorage.getItem('access');
  const base = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        const [oRes, qRes] = await Promise.all([
          fetch(`${base}/student/subject-offerings/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${base}/student/quizzes/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!oRes.ok) {
          setOfferings([]);
          setErrorMsg('Failed to load subjects.');
        } else {
          const oData = (await oRes.json()) as SubjectOfferingCard[];
          setOfferings(Array.isArray(oData) ? oData : []);
        }

        if (!qRes.ok) {
          setQuizzes([]);
        } else {
          const qData = (await qRes.json()) as Quiz[];
          setQuizzes(Array.isArray(qData) ? qData : []);
        }
      } catch (e) {
        console.error(e);
        setErrorMsg('Network error while loading dashboard.');
        setOfferings([]);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  // ✅ Upcoming: OPEN + SCHEDULED, sorted by urgency + due time
  const isOpen = (q: Quiz) => (q.is_open === true) || q.status === 'OPEN';
  const isUpcoming = (q: Quiz) => (q.is_upcoming === true) || q.status === 'SCHEDULED';

  const upcoming = useMemo(() => {
    const query = qSearch.trim().toLowerCase();

    const items = quizzes
      .filter((q) => isOpen(q) || isUpcoming(q))
      .filter((q) => {
        if (!query) return true;
        const hay = `${q.title ?? ''} ${q.subject_name ?? ''}`.toLowerCase();
        return hay.includes(query);
      })
      .map((q) => {
        const status: QuizStatus =
          isOpen(q) ? 'OPEN' : isUpcoming(q) ? 'SCHEDULED' : (q.status as QuizStatus) ?? 'SCHEDULED';

        const iso = dueIso(q);
        const urgency = urgencyFromDate(iso);
        const takeable = canTakeQuiz(q);

        return {
          key: `Q-${q.id}`,
          title: q.title,
          subject: q.subject_name ?? '—',
          dueLabel: iso ? formatDate(iso) : '—',
          urgency,
          status,
          quizId: q.id,
          takeable,
          link: takeable ? `/student/activities/${q.id}/take` : `/student/activities`,
        };
      });

    const rank = { high: 0, medium: 1, low: 2 } as const;
    items.sort((a, b) => rank[a.urgency] - rank[b.urgency]);

    return items.slice(0, 8);
  }, [quizzes, qSearch]);

  const stats = useMemo(() => {
    const avgs = offerings
      .map((o) => o.average)
      .filter((v) => typeof v === 'number')
      .map((v) => safeNumber(v));

    const overallAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;

    const openCount = quizzes.filter((q) => q.status === 'OPEN').length;
    const scheduledCount = quizzes.filter((q) => q.status === 'SCHEDULED').length;

    return {
      subjectCount: offerings.length,
      overallAvg: overallAvg != null ? overallAvg.toFixed(1) : '—',
      openScheduled: openCount + scheduledCount,
      openCount,
      scheduledCount,
    };
  }, [offerings, quizzes]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">

          <div className="h-10 w-10 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />

          <p className="mt-4 text-slate-600 font-bold">
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">

          <h2 className="text-xl font-black text-red-600">
            Unable to load profile
          </h2>

          <p className='mt-2 text-slate-500'>
            We couldn't retrive your student information
          </p>

          <p className='mt-4 text-sm text-slate-400'>
            Please try refreshing the page
          </p>
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-2xl font-black">Student Dashboard</h1>
        <p className="text-rose-600 font-bold mt-2">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="p-4 md:p-6 mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Good morning,</p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-[44px]">
                {student?.first_name} ! <span className="text-[34px]">👋</span>
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {student?.grade_level}  <span className="px-1">•</span> A.Y. 2025 - 2026 
            </p>
            
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            label="Overall Average" 
            value={stats.overallAvg} 
            hint="Across current subjects" 
            Icon={GraduationCap} 
          />

          <StatCard 
            label="Subjects" 
            value={stats.subjectCount} 
            hint="Enrolled this term" 
            Icon={Layers} 
          />
          
          <StatCard
            label="Upcoming Activities"
            value={stats.openScheduled}
            hint={`${stats.openCount} open • ${stats.scheduledCount} scheduled`}
            Icon={ClipboardList}
          />
        </section>

        {/* Main */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Subjects */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">My Subjects</h2>
              <Link to="/student/subject" className="text-xs font-black text-indigo-600 hover:underline">
                View all
              </Link>
            </div>

            {offerings.length === 0 ? (
              <div className="text-slate-600 font-semibold">No subjects found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offerings.map((o) => {
                  const progress = safeNumber(o.progress, 0);
                  const avg = typeof o.average === 'number' ? o.average.toFixed(1) : '—';
                  const fg = typeof o.final_grade === 'number' ? o.final_grade.toFixed(1) : '—';

                  return (
                    <Link
                      key={o.id}
                      to={`/student/subject-offering/${o.id}`}
                      className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-slate-50/30 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 truncate group-hover:text-indigo-700">
                            {o.subject_name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            Teacher: <span className="font-semibold">{o.teacher_name || 'N/A'}</span>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={18} />
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Progress</span>
                          <span className="text-slate-800">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="p-3 rounded-xl bg-white border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</div>
                            <div className="text-lg font-black text-slate-900 mt-1">{avg}%</div>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final</div>
                            <div className="text-lg font-black text-slate-900 mt-1">{fg}%</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ✅ Upcoming Activities (clickable -> take if OPEN, else -> list) */}
          <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex-1 max-h-[520px] overflow-y-auto pr-2 space-y-3 items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Upcoming Activities</h2>
                <div className="text-xs text-slate-500 mt-1">Open + scheduled quizzes</div>
              </div>
              <Link to={`/student/activities/`} className="text-xs font-black text-indigo-600 hover:underline">
                View all
              </Link>
            </div>

            {/* search */}
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  placeholder="Search upcoming…"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {upcoming.length === 0 ? (
              <div className="text-slate-600 font-semibold">No upcoming quizzes right now.</div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((t) => (
                  <Link
                    key={t.key}
                    to={t.link}
                    className="block group p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all"
                    title={t.takeable ? 'Take quiz' : 'View in activities'}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest truncate">
                          {t.subject}
                        </div>
                        <div className="font-black text-slate-900 truncate group-hover:text-indigo-700 mt-1">
                          {t.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} />
                            {t.status === 'OPEN' ? 'Closes' : 'Opens'}: {t.dueLabel}
                          </span>
                        </div>
                      </div>
                      <StatusPill status={t.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${
                          t.urgency === 'high'
                            ? 'bg-rose-50 text-rose-700'
                            : t.urgency === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {t.takeable ? 'TAKE NOW' : t.urgency.toUpperCase()}
                      </span>
                      <ChevronRight
                        className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                        size={18}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
