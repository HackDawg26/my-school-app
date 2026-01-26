import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  FileText,
  TrendingUp,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

import type { SubjectOffering } from "./subjectOffering";

// ---------------- Types ----------------

type QuizStatus = "DRAFT" | "SCHEDULED" | "OPEN" | "CLOSED";

type SubjectOfferingDetail = SubjectOffering;

type Quiz = {
  id: number;
  title: string;
  open_time: string | null;
  close_time: string | null;
  status: QuizStatus;
  total_points?: number;
};

type RecentQuizGrade = {
  student: string;
  quiz: string;
  score: number;
  total: number;
  percent: number;
  submitted_at?: string;
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: "stat-green" | "stat-red" | "stat-purple" | "stat-orange" | "stat-blue";
};

// ---------------- Helpers ----------------

function getToken(): string | null {
  const savedUser = localStorage.getItem("user");
  try {
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

function formatDateShort(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function quizStatus(q: Quiz): QuizStatus {
  // backend already provides status
  return q.status;
}

// ---------------- UI ----------------

const SubjectStatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  const colorMap = {
    "stat-green": "bg-emerald-100 text-emerald-600",
    "stat-red": "bg-rose-100 text-rose-600",
    "stat-purple": "bg-purple-100 text-purple-600",
    "stat-orange": "bg-amber-100 text-amber-600",
    "stat-blue": "bg-blue-100 text-blue-600",
  };

  return (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-md border border-gray-100">
      <div className={`p-3 rounded-full mr-4 ${colorMap[colorClass]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <h3 className="text-sm font-medium text-gray-500 mt-1">{title}</h3>
      </div>
    </div>
  );
};

function StatusPill({ status }: { status: QuizStatus }) {
  const cls =
    status === "OPEN"
      ? "bg-emerald-50 border-emerald-100 text-emerald-600"
      : status === "CLOSED"
      ? "bg-rose-50 border-rose-100 text-rose-700"
      : status === "SCHEDULED"
      ? "bg-amber-50 border-amber-100 text-amber-600"
      : "bg-slate-50 border-slate-200 text-slate-500";

  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cls}`}>
      {status}
    </span>
  );
}

// ---------------- Component ----------------

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);

  const [offering, setOffering] = useState<SubjectOfferingDetail | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [recent, setRecent] = useState<RecentQuizGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setErrorMsg("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }
    if (!subjectId) {
      setErrorMsg("Invalid subject offering id.");
      setLoading(false);
      return;
    }

    const base = "http://127.0.0.1:8000/api";
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [offeringRes, quizzesRes, recentRes] = await Promise.allSettled([
          axios.get<SubjectOfferingDetail>(`${base}/subject-offerings/${subjectId}/`, { headers }),
          axios.get<Quiz[]>(`${base}/subject-offerings/${subjectId}/quizzes/`, { headers }),
          axios.get<RecentQuizGrade[]>(`${base}/subject-offerings/${subjectId}/recent-quiz-grades/`, { headers }),
        ]);

        if (offeringRes.status === "rejected") {
          console.error("Offering load failed:", offeringRes.reason);
          setErrorMsg("Failed to load subject offering.");
          setOffering(null);
          setQuizzes([]);
          setRecent([]);
          return;
        }

        setOffering(offeringRes.value.data);

        if (quizzesRes.status === "fulfilled") {
          setQuizzes(Array.isArray(quizzesRes.value.data) ? quizzesRes.value.data : []);
        } else {
          console.warn("Quizzes load failed:", quizzesRes.reason);
          setQuizzes([]);
        }

        if (recentRes.status === "fulfilled") {
          setRecent(Array.isArray(recentRes.value.data) ? recentRes.value.data : []);
        } else {
          console.warn("Recent grades load failed:", recentRes.reason);
          setRecent([]);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Network error while loading subject page.");
        setOffering(null);
        setQuizzes([]);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [subjectId]);

  const computed = useMemo(() => {
    const totalStudents = offering?.students ?? 0;

    const openQuizzes = quizzes.filter((q) => quizStatus(q) === "OPEN").length;
    const closedQuizzes = quizzes.filter((q) => quizStatus(q) === "CLOSED").length;

    return { totalStudents, openQuizzes, closedQuizzes };
  }, [offering, quizzes]);

  // ---------------- Render states ----------------

  if (loading) {
    return (
      <div className="p-10 text-center bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Loading Subject...</h1>
        <p className="text-gray-600">Fetching offering, quizzes, and recent quiz grades.</p>
      </div>
    );
  }

  if (errorMsg || !offering) {
    return (
      <div className="p-10 text-center bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Cannot Load Subject</h1>
        <p className="text-gray-600 mb-6">{errorMsg ?? "Not found."}</p>
        <Link
          to="/teacher/subject"
          className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Subject List
        </Link>
      </div>
    );
  }

  // ---------------- Main UI ----------------

  return (
    <section className="flex flex-col bg-slate-50/30 min-h-screen p-2 font-sans">
      <main className="mx-auto space-y-8 w-full max-w-screen">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SubjectStatCard
            title="Avg. Performance"
            value={offering.average != null ? `${Number(offering.average).toFixed(1)}%` : "—"}
            icon={TrendingUp}
            colorClass={typeof offering.average === "number" && offering.average < 85 ? "stat-red" : "stat-green"}
          />
          <SubjectStatCard title="Total Students" value={computed.totalStudents} icon={Users} colorClass="stat-purple" />
          <SubjectStatCard title="Open Quizzes" value={computed.openQuizzes} icon={FileText} colorClass="stat-orange" />
          <SubjectStatCard title="Closed Quizzes" value={computed.closedQuizzes} icon={BookOpen} colorClass="stat-blue" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Quizzes */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Quizzes</h2>
              <Link to={`/teacher/subject/${subjectId}/activities`} className="text-xs font-bold text-indigo-600 hover:underline">
                View Activities
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
              {quizzes.length === 0 ? (
                <div className="p-6 text-slate-600">No quizzes yet for this subject offering.</div>
              ) : (
                quizzes.map((q) => {
                  const status = quizStatus(q);
                  const due = q.close_time ? formatDateShort(q.close_time) : formatDateShort(q.open_time);

                  return (
                    <Link
                      key={q.id}
                      to={`/teacher/activities/${q.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-5">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                            <FileText size={20} />
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 text-base">{q.title}</h4>
                            <p className="text-xs font-medium text-slate-400">
                              {q.open_time ? `Starts ${formatDateShort(q.open_time)}` : "No schedule"} •{" "}
                              {q.close_time ? `Ends ${formatDateShort(q.close_time)}` : "No end date"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-300 uppercase">Due</p>
                            <p className="text-xs font-bold text-slate-600">{due}</p>
                          </div>
                          <StatusPill status={status} />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Recent Grades */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Quiz Grades</div>
                <div className="text-xs text-slate-500 mt-1">Latest 10 submissions</div>
              </div>

              {recent.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">No recent quiz grades yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recent.slice(0, 10).map((r, idx) => (
                    <div key={idx} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{r.student}</div>
                          <div className="text-xs text-slate-500 truncate">{r.quiz}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-slate-900 text-sm">
                            {r.score}/{r.total}
                          </div>
                          <div className="text-xs text-slate-500">{r.percent.toFixed(1)}%</div>
                        </div>
                      </div>

                      {r.submitted_at ? (
                        <div className="mt-2 text-[11px] text-slate-400">
                          Submitted: {new Date(r.submitted_at).toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
