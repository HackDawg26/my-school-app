import React, {useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileText,
  Search,
  ArrowUpDown,
  PlayCircle,
  RefreshCw,
  Layers,
  FolderOpen,
  CalendarClock,
  BarChart,
  Eye,
  X,
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// STUDENT HOOKS
import { useStudentSubject } from '../../../hooks/useStudentSubject';
import { useStudentSubjectQuizzes } from '../../../hooks/useStudentSubjectQuizzes';
import { useStudentSubjectFiles } from '../../../hooks/useStudentSubjectFiles';

import type { StudentQuiz } from '../../../types/studentTypes';

type QuizStatus = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED';



function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function getQuizStatus(q: StudentQuiz): QuizStatus {
  if (q.is_open) return 'OPEN';
  if (q.is_upcoming) return 'SCHEDULED';
  if (q.is_closed) return 'CLOSED';
  return 'SCHEDULED';
}

function statusMeta(s: QuizStatus) {
  if (s === 'OPEN')
    return {
      chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      dot: 'bg-emerald-500',
      label: 'OPEN',
    };
  if (s === 'SCHEDULED')
    return {
      chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      dot: 'bg-amber-500',
      label: 'SCHEDULED',
    };
  if (s === 'CLOSED')
    return {
      chip: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
      dot: 'bg-slate-400',
      label: 'CLOSED',
    };
  return {
    chip: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    label: 'DRAFT',
  };
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function isPreviewable(contentType: string, url: string){
  const lower = (url || "").toLowerCase();
  if ((contentType || "").startsWith("image/")) {
      return "image" as const;
  }

  if (
    contentType === "application/pdf" ||
    lower.endsWith(".pdf")
  ) {
    return "pdf" as const;
  }

  if (lower.match(/\.(png|jpg|jpeg|webp)$/)) {
    return "image" as const;
  }

  return null; 
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

function TabButton({
  active,
  icon,
  label,
  onClick,
  count,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group relative inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition',
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
      ].join(' ')}
    >
      <span className={active ? 'text-white' : 'text-slate-600'}>{icon}</span>
      <span className="uppercase tracking-wider text-[12px]">{label}</span>
      {typeof count === 'number' ? (
        <span
          className={[
            'ml-1 rounded-full px-2 py-0.5 text-[11px] font-black',
            active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700',
          ].join(' ')}
        >
          {count}
        </span>
      ) : null}
      <span
        className={[
          'absolute inset-0 rounded-2xl ring-2 ring-transparent transition',
          active ? 'ring-white/10' : 'group-hover:ring-slate-200',
        ].join(' ')}
      />
    </button>
  );
}

export default function StudentSubjectpage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const offeringId = Number(id || 0);
  const [activeTab, setActiveTab] = useState<'activities' | 'files'>('activities');

  const [preview, setPreview] = useState<{
    kind: "pdf" | "image";
    url: string;
    title: string;
  } | null>(null);


  const {
    data: offering,
    isLoading: subjectLoading,
    error: subjectError,
  } = useStudentSubject(offeringId);

  const {
    data: quizzes = [],
    isLoading: quizzesLoading,
    error: quizzesError,
  } = useStudentSubjectQuizzes(offeringId);

  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
    isFetching: filesFetching,
  } = useStudentSubjectFiles(offeringId);

  

  // files UI state
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');


  const stats = useMemo(() => {
    const grade = typeof offering?.final_grade === 'number' ? Math.round(offering.final_grade) : null;
    return { grade, activityCount: quizzes.length, fileCount: files.length };
  }, [offering, quizzes, files]);

  // Sort quizzes: OPEN first → SCHEDULED → CLOSED → DRAFT
  const sortedQuizzes = useMemo(() => {
    const order = { OPEN: 0, SCHEDULED: 1, CLOSED: 2, DRAFT: 3 } as const;

    return [...quizzes]
      .map((qq) => ({ ...qq, _status: getQuizStatus(qq) }))
      .sort((a, b) => {
        const sa = order[a._status];
        const sb = order[b._status];
        if (sa !== sb) return sa - sb;

        const da = new Date(a.close_time ?? a.open_time ?? 0).getTime();
        const db = new Date(b.close_time ?? b.open_time ?? 0).getTime();
        return da - db;
      });
  }, [quizzes]);

  // Files filtering + sorting
  const visibleFiles = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let arr = [...files].filter((f) => (needle ? f.title.toLowerCase().includes(needle) : true));

    if (sort === 'name') {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'oldest') {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return arr;
  }, [files, q, sort]);



  if (filesLoading || subjectLoading || quizzesLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-2xl bg-white border border-slate-200 shadow-sm" />
            <div className="flex-1">
              <div className="h-8 w-64 rounded-2xl bg-slate-200/80 animate-pulse" />
              <div className="mt-2 h-3 w-40 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-32" />
              <div className="mt-5">
                <SkeletonLine w="w-24" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-40" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-32" />
              <div className="mt-5">
                <SkeletonLine w="w-16" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <SkeletonLine w="w-32" />
              <div className="mt-5">
                <SkeletonLine w="w-16" />
              </div>
              <div className="mt-3">
                <SkeletonLine w="w-44" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 rounded-2xl bg-slate-200/80 animate-pulse" />
              <div className="h-10 w-28 rounded-2xl bg-slate-200/80 animate-pulse" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (subjectError || quizzesError || filesError || !offering) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <button
            onClick={() => navigate('/student/subject')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-6 rounded-3xl border border-rose-200 bg-white p-6">
            <div className="text-sm font-black uppercase tracking-widest text-rose-500">Error</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{subjectError 
                ? "Unable to load subject." 
                : quizzesError 
                ? "Unable to load subject activities."
                : filesError
                ? "Unable to load subject files."
                :"Not found"}
            </div>
            <div className="mt-1 text-sm text-slate-500">Try going back and selecting the subject again.</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className=" bg-slate-50">
      {/* preview for files */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="font-black text-slate-900 truncate">
                {preview.title}
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-[70vh] bg-slate-50">
              {preview.kind === "image" ? (
                <div className="h-full flex items-center justify-center p-4">
                  <img
                    src={preview.url}
                    alt={preview.title}
                    className="max-h-full max-w-full rounded-xl object-contain"
                  />
                </div>
              ) : (
                <iframe
                  title={preview.title}
                  src={preview.url}
                  className="w-full h-full"
                />
              )}
            </div>

          </div>
        </div>
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/student/subject"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="truncate text-xl md:text-2xl font-black tracking-wide text-slate-950">
                  {offering.subject_name}
                </h1>
              </div>
              <div className="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                {offering.teacher_name ?? '—'}
              </div>
            </div>

            <div className="ml-auto hidden md:flex items-center gap-2">
              <TabButton
                active={activeTab === 'activities'}
                icon={<Layers size={16} />}
                label="Activities"
                
                onClick={() => setActiveTab('activities')}
              />
              <TabButton
                active={activeTab === 'files'}
                icon={<FolderOpen size={16} />}
                label="Files"
                
                onClick={() => setActiveTab('files')}
              />
            </div>
          </div>

          {/* mobile tabs */}
          <div className="mt-3 flex md:hidden gap-2">
            <TabButton
              active={activeTab === 'activities'}
              icon={<Layers size={16} />}
              label="Activities"
              count={stats.activityCount}
              onClick={() => setActiveTab('activities')}
            />
            <TabButton
              active={activeTab === 'files'}
              icon={<FolderOpen size={16} />}
              label="Files"
              count={stats.fileCount}
              onClick={() => setActiveTab('files')}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto px-2 md:px-4 py-4 md:py-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<BarChart size={18} />}
            label="Current Grade"
            value={
              <div className="flex items-baseline gap-2">
                <span>{stats.grade ?? '—'}</span>
                <span className="text-base font-black text-slate-400">/ 100</span>
              </div>
            }
            hint="Official SF9 entry"
          />
          <StatCard
            icon={<Layers size={18} />}
            label="Activities"
            value={<span>{stats.activityCount}</span>}
            hint="Quizzes / Exams"
          />
          <StatCard
            icon={<FolderOpen size={18} />}
            label="Files"
            value={<span>{stats.fileCount}</span>}
            hint="Handouts / Modules"
          />
        </div>

        {/* Content card */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Workspace</div>
                <div className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  {activeTab === 'activities' ? 'Activities' : 'Files'}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {activeTab === 'activities'
                    ? 'Start open quizzes and check upcoming schedules.'
                    : 'Browse handouts, modules, and shared materials.'}
                </div>
              </div>

              
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* ACTIVITIES */}
            {activeTab === 'activities' && (
              <div>
                {sortedQuizzes.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <CalendarClock size={18} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">No activities yet</div>
                        <div className="mt-1 text-sm text-slate-600">
                          Your teacher hasn’t posted quizzes/exams for this subject.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <div className="max-h-140 overflow-auto">
                        <table className="w-full text-left">
                          <thead className="sticky top-0 z-10 bg-white">
                            <tr className="border-b border-slate-200">
                              <th className="py-4 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Activity
                              </th>
                              <th className="py-4 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Open
                              </th>
                              <th className="py-4 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Close
                              </th>
                              <th className="py-4 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Status
                              </th>
                              <th className="py-4 px-5 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {sortedQuizzes.map((qq) => {
                              const status = getQuizStatus(qq);
                              const canStart = status === 'OPEN';
                              const meta = statusMeta(status);

                              return (
                                <tr key={qq.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-5 px-5">
                                    <div className="font-black text-slate-900">{qq.title}</div>
                                    {qq.time_limit ? (
                                      <div className="mt-1 text-xs text-slate-500">
                                        Time limit: <span className="font-bold">{qq.time_limit} min</span>
                                      </div>
                                    ) : (
                                      <div className="mt-1 text-xs text-slate-500">No time limit</div>
                                    )}
                                  </td>
                                  <td className="py-5 px-5 text-sm text-slate-600">{formatDateTime(qq.open_time)}</td>
                                  <td className="py-5 px-5 text-sm text-slate-600">{formatDateTime(qq.close_time)}</td>
                                  <td className="py-5 px-5">
                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${meta.chip}`}>
                                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                                      {meta.label}
                                    </span>
                                  </td>
                                  <td className="py-5 px-5 text-right">
                                    {canStart ? (
                                      <Link
                                        to={`/student/activities/`}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-600 transition"
                                      >
                                        <PlayCircle className="h-4 w-4" />
                                        Start
                                      </Link>
                                    ) : (
                                      <button
                                        disabled
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 cursor-not-allowed"
                                      >
                                        <PlayCircle className="h-4 w-4" />
                                        Start
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden p-3 space-y-3">
                      {sortedQuizzes.map((qq) => {
                        const status = getQuizStatus(qq);
                        const canStart = status === 'OPEN';
                        const meta = statusMeta(status);

                        return (
                          <div key={qq.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-black text-slate-900 truncate">{qq.title}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  Open: {formatDate(qq.open_time)} • Close: {formatDate(qq.close_time)}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {qq.time_limit ? `Time limit: ${qq.time_limit} min` : 'No time limit'}
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${meta.chip}`}>
                                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                                {meta.label}
                              </span>
                            </div>

                            <div className="mt-3">
                              {canStart ? (
                                <Link
                                  to={`/student/activities/${qq.id}/take`}
                                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-600 transition"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  Start
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-300 cursor-not-allowed"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  Start
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-slate-500">
                  Tip: Only <span className="font-black text-slate-900">OPEN</span> activities can be started.
                </div>
              </div>
            )}

            {/* FILES */}
            {activeTab === 'files' && (
              <div>
                {/* controls */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search files (module, week 1, ppt)…"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-3 rounded-2xl border border-slate-200 bg-white">
                      <ArrowUpDown size={18} className="text-slate-500" />
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        className="text-sm font-black text-slate-700 outline-none bg-transparent"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="name">Name</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => refetchFiles()}
                      disabled={filesFetching}
                      className={[
                        'inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-black transition',
                        filesFetching
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      ].join(' ')}
                      title="Refresh"
                    >
                      <RefreshCw size={16} className={filesFetching ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* list */}
                {visibleFiles.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">No files found</div>
                        <div className="mt-1 text-sm text-slate-600">Try a different keyword or clear the search.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="max-h-[560px] overflow-auto divide-y divide-slate-100">
                      {visibleFiles.map((f) => {
                        const previewKind = isPreviewable(
                          f.content_type,
                          f.file_url
                        );

                        return (
                          <div
                            key={f.id}
                            className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                                <FileText size={18} />
                              </div>

                              <div className="min-w-0">
                                <div className="font-black text-slate-900 truncate">{f.title}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {formatBytes(f.file_size)} • Uploaded {formatDateTime(f.created_at)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end">
                              
                              {previewKind && (
                                <button
                                  type='button'
                                  onClick={() => setPreview({
                                    kind: previewKind,
                                    url: f.file_url,
                                    title: f.title,
                                  })
                                }
                                  className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 transition'
                                >
                                  <Eye size={16} />
                                  Preview
                                </button>
                              )}

                              <a
                                href={f.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-600 transition"
                                title="Open"
                              >
                                <Download size={16} />
                                Open
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-slate-500">
                  Tip: Use <span className="font-black text-slate-900">Preview</span> for PDFs/images, or{' '}
                  <span className="font-black text-slate-900">Open</span> to download.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
