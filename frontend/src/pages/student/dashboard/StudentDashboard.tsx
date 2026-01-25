'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';

// ---------------- Types ----------------

type SubjectOfferingCard = {
  id: number;
  subject_name: string;
  teacher_name?: string;
  progress?: number; // 0..100 (optional)
  average?: number;  // 0..100 (optional)
  final_grade?: number | null; // ✅ add this
};

type Assignment = {
  id: number;
  title: string;
  due_date?: string | null;
  status?: 'PENDING' | 'SUBMITTED' | 'GRADED';
};

type QuizStatus = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED';
type Quiz = {
  id: number;
  title: string;
  open_time?: string | null;
  close_time?: string | null;
  status?: QuizStatus;
};

type Task = {
  id: string;
  subject: string;
  taskName: string;
  dueDate: string;
  urgency: 'high' | 'medium' | 'low';
};

// ---------------- Helpers ----------------

function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
}

function urgencyFromDate(iso?: string | null): Task['urgency'] {
  if (!iso) return 'low';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'low';
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 'high';
  if (diffDays <= 3) return 'medium';
  return 'low';
}

const StatCard = ({ label, value, trend, type }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-lg ${
          type === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'
        }`}
      >
        {trend}
      </span>
    </div>
  </div>
);

// ---------------- Component ----------------

export default function StudentDashboard() {
  const [offerings, setOfferings] = useState<SubjectOfferingCard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

        // 1) Load offerings list (main source of truth for dashboard)
        const res = await fetch(`${base}/student/subject-offerings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('subject-offerings list failed', err);
          setErrorMsg('Failed to load subjects.');
          setOfferings([]);
          setTasks([]);
          return;
        }

        const data = (await res.json()) as SubjectOfferingCard[];
        const list = Array.isArray(data) ? data : [];
        setOfferings(list);

        // 2) Optional: build upcoming deadlines by probing nested endpoints
        // If your backend does NOT have these endpoints yet, it will just return empty tasks (no crash).
        const deadlineTasks: Task[] = [];

        await Promise.all(
          list.map(async (o) => {
            const [aRes, qRes] = await Promise.all([
              fetch(`${base}/student/subject-offerings/${o.id}/assignments/`, {
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => null),
              fetch(`${base}/student/subject-offerings/${o.id}/quizzes/`, {
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => null),
            ]);

            // Assignments → tasks
            if (aRes && aRes.ok) {
              const aData = (await aRes.json()) as Assignment[];
              (Array.isArray(aData) ? aData : []).forEach((a) => {
                // show only pending-ish
                if (a.status === 'SUBMITTED' || a.status === 'GRADED') return;

                const urgency = urgencyFromDate(a.due_date);
                deadlineTasks.push({
                  id: `A-${o.id}-${a.id}`,
                  subject: o.subject_name,
                  taskName: a.title,
                  dueDate: a.due_date ? formatDate(a.due_date) : '—',
                  urgency,
                });
              });
            }

            // Quizzes → tasks (use close_time as "due")
            if (qRes && qRes.ok) {
              const qData = (await qRes.json()) as Quiz[];
              (Array.isArray(qData) ? qData : []).forEach((q) => {
                // only show open/scheduled
                if (q.status && !['SCHEDULED', 'OPEN'].includes(q.status)) return;

                const dueIso = q.close_time ?? q.open_time ?? null;
                const urgency = urgencyFromDate(dueIso);

                deadlineTasks.push({
                  id: `Q-${o.id}-${q.id}`,
                  subject: o.subject_name,
                  taskName: q.title,
                  dueDate: dueIso ? formatDate(dueIso) : '—',
                  urgency,
                });
              });
            }
          })
        );

        // Sort: soonest first (best-effort by urgency bucket)
        const urgencyRank = { high: 0, medium: 1, low: 2 } as const;
        deadlineTasks.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);

        setTasks(deadlineTasks.slice(0, 6)); // keep it tidy
      } catch (e) {
        console.error(e);
        setErrorMsg('Network error while loading dashboard.');
        setOfferings([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  const stats = useMemo(() => {
  const firstOfferingWithGrade = offerings.find(
    (o) => typeof o.final_grade === 'number'
  );

  return {
    finalGrade:
      firstOfferingWithGrade?.final_grade !== undefined && firstOfferingWithGrade.final_grade !== null
        ? firstOfferingWithGrade.final_grade.toFixed(1)
        : '—',
    upcomingCount: tasks.length,
  };
}, [offerings, tasks]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 p-6">
        <p className="text-slate-600 font-bold">Loading dashboard…</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 p-6">
        <h1 className="text-2xl font-black">Student Dashboard</h1>
        <p className="text-rose-600 font-bold mt-2">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <main className="flex-1 p-1 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 font-medium">
              You have <span className="text-blue-600">{stats.upcomingCount}</span> upcoming items.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard label="Final Grade" value={stats.finalGrade} trend="Quarterly Avg" type="up" />
        </div>

        {/* Upcoming Deadlines */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm xl:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                View All
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="text-slate-600 font-semibold">No deadlines available yet.</div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                        {task.subject}
                      </span>
                      <div
                        className={`p-1.5 rounded-lg ${
                          task.urgency === 'high'
                            ? 'bg-red-50 text-red-500'
                            : task.urgency === 'medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Clock size={14} />
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {task.taskName}
                    </h3>

                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`text-[11px] px-3 py-1 rounded-full font-bold ${
                          task.urgency === 'high'
                            ? 'bg-red-500 text-white'
                            : task.urgency === 'medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border text-slate-500'
                        }`}
                      >
                        {task.dueDate}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
