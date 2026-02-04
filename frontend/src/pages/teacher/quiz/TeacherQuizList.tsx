'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  ArrowUpDown,
  CalendarClock,
  ClipboardList,
  Layers,
  Settings2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Download,
} from 'lucide-react';

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

type SortKey = 'status' | 'open_desc' | 'open_asc' | 'title' | 'subject';

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

function statusRank(q: Quiz) {
  // OPEN first, then UPCOMING, then CLOSED, then fallback
  if (q.is_open) return 0;
  if (q.is_upcoming) return 1;
  if (q.is_closed) return 2;
  return 3;
}

function statusChip(q: Quiz) {
  const base = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider';
  if (q.is_open)
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`}>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Open
      </span>
    );
  if (q.is_upcoming)
    return (
      <span className={`${base} bg-amber-50 text-amber-700 ring-1 ring-amber-200`}>
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Upcoming
      </span>
    );
  if (q.is_closed)
    return (
      <span className={`${base} bg-slate-50 text-slate-600 ring-1 ring-slate-200`}>
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Closed
      </span>
    );

  return (
    <span className={`${base} bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200`}>
      <span className="h-2 w-2 rounded-full bg-indigo-500" />
      {q.status || 'Status'}
    </span>
  );
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

export default function TeacherQuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // UI controls
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('status');

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;

      const response = await axios.get('http://127.0.0.1:8000/api/teacher/quizzes/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuizzes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
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
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const stats = useMemo(() => {
    const open = quizzes.filter((q) => q.is_open).length;
    const upcoming = quizzes.filter((q) => q.is_upcoming).length;
    const closed = quizzes.filter((q) => q.is_closed).length;
    return { total: quizzes.length, open, upcoming, closed };
  }, [quizzes]);

  const visibleQuizzes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let arr = [...quizzes].filter((q) => {
      if (!needle) return true;
      return (
        q.title.toLowerCase().includes(needle) ||
        q.subject_name.toLowerCase().includes(needle) ||
        q.quiz_id.toLowerCase().includes(needle)
      );
    });

    arr.sort((a, b) => {
      if (sort === 'status') {
        const ra = statusRank(a);
        const rb = statusRank(b);
        if (ra !== rb) return ra - rb;
        // tie-breaker: open_time desc
        return new Date(b.open_time).getTime() - new Date(a.open_time).getTime();
      }

      if (sort === 'open_desc') return new Date(b.open_time).getTime() - new Date(a.open_time).getTime();
      if (sort === 'open_asc') return new Date(a.open_time).getTime() - new Date(b.open_time).getTime();
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'subject') return a.subject_name.localeCompare(b.subject_name);

      return 0;
    });

    return arr;
  }, [quizzes, query, sort]);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <div className="h-8 w-64 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse" />
            <div className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse" />
            <div className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse" />
          </div>
          <div className="mt-6 h-14 rounded-3xl border border-slate-200 bg-white animate-pulse" />
          <div className="mt-4 space-y-3">
            <div className="h-20 rounded-3xl border border-slate-200 bg-white animate-pulse" />
            <div className="h-20 rounded-3xl border border-slate-200 bg-white animate-pulse" />
            <div className="h-20 rounded-3xl border border-slate-200 bg-white animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Teacher</div>
              <h1 className="truncate text-xl md:text-2xl font-black tracking-tight text-slate-900">
                My Activities
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={fetchQuizzes}
                className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                title="Refresh list"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <Link
                to="/teacher/activities/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 transition"
              >
                <Plus size={16} />
                Create Activity
              </Link>
            </div>
          </div>

          {/* Search + sort row */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, subject, or quiz ID…"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-3 rounded-2xl border border-slate-200 bg-white">
                <ArrowUpDown size={18} className="text-slate-500" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="text-sm font-black text-slate-700 outline-none bg-transparent"
                >
                  <option value="status">Status (Open → Upcoming → Closed)</option>
                  <option value="open_desc">Open time (Newest)</option>
                  <option value="open_asc">Open time (Oldest)</option>
                  <option value="title">Title (A–Z)</option>
                  <option value="subject">Subject (A–Z)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={fetchQuizzes}
                className="sm:hidden inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                title="Refresh list"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-8xl px-4 md:px-6 py-6 md:py-10">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<Layers size={18} />} label="Total" value={<span>{stats.total}</span>} hint="All activities" />
          <StatCard icon={<CalendarClock size={18} />} label="Open" value={<span>{stats.open}</span>} hint="Available now" />
          <StatCard icon={<ClipboardList size={18} />} label="Upcoming" value={<span>{stats.upcoming}</span>} hint="Scheduled" />
          <StatCard icon={<Download size={18} />} label="Closed" value={<span>{stats.closed}</span>} hint="Ended / locked" />
        </div>

        {/* List card */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Activities</div>
                <div className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">Quiz List</div>
                <div className="mt-2 text-sm text-slate-600">
                  Manage your quizzes, schedules, and items.
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-black text-slate-700">
                  <Settings2 size={16} className="text-slate-600" />
                  {visibleQuizzes.length} shown
                </div>
              </div>
            </div>
          </div>

          {visibleQuizzes.length === 0 ? (
            <div className="p-8">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="font-black text-slate-900">No activities found</div>
                <div className="mt-1 text-sm text-slate-600">
                  {quizzes.length === 0
                    ? 'No quizzes yet. Create your first activity!'
                    : 'Try a different search keyword or change sorting.'}
                </div>
                <div className="mt-4">
                  <Link
                    to="/teacher/activities/create"
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 transition"
                  >
                    <Plus size={16} />
                    Create Activity
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-5 md:p-6 hover:bg-slate-50 transition">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* left */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg md:text-xl font-black text-slate-900 truncate">{quiz.title}</div>
                        {statusChip(quiz)}
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        Subject: <span className="font-bold text-slate-800">{quiz.subject_name}</span>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs text-slate-600">
                        
                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opens</div>
                          <div className="mt-1 font-bold text-slate-800">{fmtDT(quiz.open_time)}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closes</div>
                          <div className="mt-1 font-bold text-slate-800">{fmtDT(quiz.close_time)}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</div>
                          <div className="mt-1 font-bold text-slate-800">{quiz.question_count}</div>
                        </div>
                      </div>
                    </div>

                    {/* right */}
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/teacher/activities/${quiz.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 transition"
                        title="Manage activity"
                      >
                        <ExternalLink size={16} />
                        Manage
                      </Link>

                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 hover:bg-rose-100 transition"
                        title="Delete activity"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Tip: Use search to quickly find a quiz by <span className="font-black text-slate-900">Quiz ID</span>.
        </div>
      </div>
    </main>
  );
}
