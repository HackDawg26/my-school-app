'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BarChart3,
  AlertTriangle,
  Clock,
  MapPin,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

// --- Type Definitions ---

interface SubjectOffering {
  id: number;
  name: string;
  section: string;
  grade: string | number;
  room_number: string;
  students: number;
  nextClass: string;
  average: number;
  pendingTasks: number;
}

// --- Helpers ---

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

function chipClass(kind: 'good' | 'warn' | 'muted') {
  if (kind === 'good') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (kind === 'warn') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<SubjectOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!token) {
        setLoading(false);
        setErrorMsg('Not authenticated. Please log in again.');
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch('http://127.0.0.1:8000/api/subject-offerings/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to load subject offerings:', err);
          setErrorMsg('Failed to load your subject offerings.');
          setSubjects([]);
          return;
        }

        const data = (await res.json()) as SubjectOffering[];
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErrorMsg('Network error while loading subjects.');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [token]);

  const { totalClasses, totalStudents, totalPendingTasks, overallAvg } = useMemo(() => {
    const totalClasses = subjects.length;
    const totalStudents = subjects.reduce((sum, s) => sum + (s.students || 0), 0);
    const totalPendingTasks = subjects.reduce((sum, s) => sum + (s.pendingTasks || 0), 0);

    const overallAvg =
      totalClasses > 0
        ? (subjects.reduce((sum, s) => sum + (Number(s.average) || 0), 0) / totalClasses).toFixed(1)
        : 'N/A';

    return { totalClasses, totalStudents, totalPendingTasks, overallAvg };
  }, [subjects]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    []
  );

  // --- Loading / Error ---
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="h-8 w-64 rounded-2xl bg-slate-200/80 animate-pulse" />
              <div className="mt-2 h-3 w-48 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
            <div className="h-10 w-28 rounded-2xl bg-white border border-slate-200 shadow-sm" />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-36" />
              <div className="mt-5">
                <SkeletonLine w="w-20" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-36" />
              <div className="mt-5">
                <SkeletonLine w="w-24" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-36" />
              <div className="mt-5">
                <SkeletonLine w="w-24" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-36" />
              <div className="mt-5">
                <SkeletonLine w="w-20" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <SkeletonLine w="w-40" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <div className="rounded-3xl border border-rose-200 bg-white p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500">Error</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{errorMsg}</div>
            <div className="mt-1 text-sm text-slate-500">
              If this keeps happening, check your token in localStorage and your backend permissions.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto l px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
              <Layers size={18} />
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Teacher Dashboard</div>
              <h1 className="truncate text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Overview
              </h1>
              <div className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{today}</div>
            </div>

            <div className="ml-auto hidden md:block">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">
                {totalClasses} class{totalClasses !== 1 ? 'es' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-4 md:px-6 py-6 md:py-10">
        {/* Quick stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen size={18} />}
            label="Total Classes"
            value={<span>{totalClasses}</span>}
            hint="Active offerings"
          />
          <StatCard
            icon={<Users size={18} />}
            label="Total Students"
            value={<span>{totalStudents}</span>}
            hint="Across all classes"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            label="Pending Tasks"
            value={<span>{totalPendingTasks}</span>}
            hint="Needs attention"
          />
          <StatCard
            icon={<BarChart3 size={18} />}
            label="Overall Avg."
            value={<span>{overallAvg === 'N/A' ? '—' : `${overallAvg}%`}</span>}
            hint="Class averages"
          />
        </div>

        {/* Subjects list */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Workspace</div>
                <div className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">Your Subjects</div>
                <div className="mt-2 text-sm text-slate-600">
                  You have <span className="font-black text-slate-900">{totalClasses}</span> active class
                  {totalClasses !== 1 ? 'es' : ''} this semester.
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {subjects.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                No subject offerings assigned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((s) => {
                  const avg = Number(s.average) || 0;
                  const avgKind: 'good' | 'warn' | 'muted' =
                    s.students === 0 ? 'muted' : avg >= 85 ? 'good' : 'warn';
                  const taskKind: 'good' | 'warn' | 'muted' =
                    (s.pendingTasks || 0) > 0 ? 'warn' : 'good';

                  return (
                    <Link
                      to={`/teacher/subject/${s.id}`}
                      key={s.id}
                      className="group block rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 transition overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                              {s.grade} - {s.section}
                            </div>
                            <div className="mt-1 text-xl font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {s.name}
                            </div>
                          </div>

                          <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                              <MapPin size={14} className="text-slate-400" />
                              Room
                            </div>
                            <div className="mt-1 font-black text-slate-900">{s.room_number || '—'}</div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                              <Clock size={14} className="text-slate-400" />
                              Next Class
                            </div>
                            <div className="mt-1 font-black text-slate-900 truncate">{s.nextClass || '—'}</div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                              Students
                            </div>
                            <div className="mt-1 text-lg font-black text-slate-900">{s.students ?? 0}</div>
                          </div>

                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                              Average
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-black ${chipClass(avgKind)}`}>
                                {s.students === 0 ? '—' : `${avg}%`}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center">
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                              Tasks
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-black ${chipClass(taskKind)}`}>
                                {s.pendingTasks ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4 border-t border-slate-100 bg-white">
                        <div className="text-xs text-slate-500">
                          Open class workspace →
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
