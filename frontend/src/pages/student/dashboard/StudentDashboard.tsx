import { useStudentProfile } from '../../../hooks/useStudentProfile';
import { useStudentSubjects } from '../../../hooks/useStudentSubjects';
import { useStudentQuizzes } from '../../../hooks/useStudentQuizzes';
import type { StudentQuiz, QuizStatus } from '../../../types/studentTypes';

import StatCard from '../../../components/studentcomponents/StatCard'

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ChevronRight,
} from 'lucide-react';


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


function dueIso(q: StudentQuiz) {
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

function canTakeQuiz(q: StudentQuiz) {
  const isOpen = q.is_open;
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


// ---------------- Component ----------------

export default function StudentDashboard() {

  const { 
    data: student,
    isLoading,
    error
  } = useStudentProfile();

  const {
    data: offerings = [],
    isLoading: subjectsLoading,
    error: subjectsError,

  } = useStudentSubjects();

    const {
    data: quizzes = [],
    isLoading: quizzesLoading,
    error: quizzesError,

  } = useStudentQuizzes();

  const [selectedSemester, setSelectedSemester] = useState(1);

  // ✅ Upcoming: OPEN + SCHEDULED, sorted by urgency + due time
  const isOpen = (q: StudentQuiz) => (q.is_open === true) ;
  const isUpcoming = (q: StudentQuiz) => (q.is_upcoming === true);

  const upcoming = useMemo(() => {

    const items = quizzes
      .filter((q) => isOpen(q) || isUpcoming(q))
      .map((q) => {
        const status: QuizStatus =
          q.is_open
            ? 'OPEN'
            : q.is_upcoming
            ? 'SCHEDULED'
            : q.is_closed
            ? 'CLOSED'
            : 'SCHEDULED';
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
  }, [quizzes]);

  const stats = useMemo(() => {
    const avgs = offerings
      .map((o) => o.average)
      .filter((v) => typeof v === 'number')
      .map((v) => safeNumber(v));

    const overallAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;

    const openCount = quizzes.filter((q) => q.is_open).length;
    const scheduledCount = quizzes.filter((q) => q.is_upcoming).length;

    return {
      subjectCount: offerings.length,
      overallAvg,
      openScheduled: openCount + scheduledCount,
      openCount,
      scheduledCount,
    };
  }, [offerings, quizzes]);

  if (isLoading || subjectsLoading || quizzesLoading) {
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

  if (subjectsError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
          <h2 className="text-xl font-black text-red-600">
            Unable to load subjects
          </h2>

          <p className="mt-2 text-slate-500">
            We couldn't retrieve your enrolled subjects.
          </p>
        </div>
      </div>
    );
  }

  if (quizzesError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
          <h2 className="text-xl font-black text-red-600">
            Unable to load activities
          </h2>

          <p className="mt-2 text-slate-500">
            We couldn't retrieve your activities.
          </p>
        </div>
      </div>
    );
  }

  return (
      <main className="sm:pt-4 md:p-6 mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Good morning,</p>
            <h1 className="mt-1 text-4xl font-lora font-extrabold tracking-wide text-slate-950 sm:text-[44px]">
                {student?.first_name} ! 
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {student?.grade_level}  <span className="px-1">•</span> A.Y. {student?.academic_year}
            </p>
          </div>

          {/* this is for changing semester and change the data[average, subjects, and activities] */}
          <div className="flex items-center justify-end">
            <label htmlFor="semester" className="sr-only">
              Select semester
            </label>

            <select
              id="semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-700 shadow-sm outline-none transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
              <option value={3}>Semester 3</option>
            </select>
          </div>

        </header>

        {/* Main */}
        <section className="space-y-6">
          {/* Top Row: Stats + Subjects */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Stats */}
            <StatCard
              label="Current Semester Average"
              value={stats.overallAvg}
            />

            {/* Subjects */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  My Subjects
                </h2>

                <Link
                  to="/student/subject"
                  className="text-xs font-black text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {offerings.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-semibold">
                  No subjects found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {offerings.map((o) => {
                    return (
                      <Link
                        key={o.id}
                        to={`/student/subject-offering/${o.id}`}
                        className="group flex items-center justify-between gap-4 py-4 px-2 rounded-xl hover:bg-slate-50 transition-all"
                      >
                        {/* Subject Information */}
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                          {o.subject_name?.charAt(0).toUpperCase() || "?"}
                        </div>

                        {/* Subject + Teacher */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            
                            {/* Subject Name */}
                            <div className="font-black text-sm text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                              {o.subject_name}
                            </div>

                            {/* Teacher - Desktop */}
                            <div className="hidden md:block text-xs text-slate-500 truncate">
                              Teacher: {o.teacher_name || "N/A"}
                            </div>
                          </div>

                          {/* Teacher - Mobile */}
                          <div className="block md:hidden text-xs text-slate-500 mt-1 truncate">
                            Teacher: {o.teacher_name || "N/A"}
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight
                          size={18}
                          className="shrink-0 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Upcoming Activities */}
          {/* Upcoming Activities */}
          <div className="grid grid-cols-1">
            <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Upcoming Activities
                </h2>

                <Link
                  to="/student/activities/"
                  className="text-xs font-black text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="py-6 text-center text-slate-500 font-semibold">
                  No upcoming activities right now.
                </div>
              ) : (
                <div>

                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-[1.2fr_2fr_1.5fr_1fr_24px] items-center gap-4 px-3 py-3 border-b border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Subject
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Title
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Date
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Availability
                    </div>

                    <div />
                  </div>

                  {/* Activity Rows */}
                  <div className="divide-y divide-slate-100">
                    {upcoming.map((t) => (
                      <Link
                        key={t.key}
                        to={t.link}
                        className="group grid grid-cols-[1fr_24px] md:grid-cols-[1.2fr_2fr_1.5fr_1fr_24px] items-center gap-4 px-3 py-4 rounded-xl hover:bg-slate-50 transition-all"
                      >

                        {/* Subject */}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-indigo-600 truncate">
                            {t.subject}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="min-w-0">
                          <div className="font-black text-sm text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                            {t.title}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 min-w-0">
                          <Clock size={14} className="flex-shrink-0" />

                          <span className="truncate">
                            {t.dueLabel}
                          </span>
                        </div>

                        {/* Availability */}
                        <div className="hidden md:block">
                          <StatusPill status={t.status} />
                        </div>

                        {/* Mobile Date */}
                        <div className="md:hidden min-w-0">
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock size={13} />

                            <span className="truncate">
                              {t.status === "OPEN"
                                ? "Closes"
                                : "Opens"}
                              : {t.dueLabel}
                            </span>
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight
                          size={18}
                          className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                        />

                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
  );
}
