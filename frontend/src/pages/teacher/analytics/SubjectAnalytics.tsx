import React, { useEffect, useMemo, useState } from "react";
import { Target, ChevronUp } from "lucide-react";

type QuizStatus = "DRAFT" | "SCHEDULED" | "OPEN" | "CLOSED";

/**
 * Matches SubjectOfferingSerializer (serializers.py)
 * fields = [
 *  'id','name','section','room_number','schedule','grade','students',
 *  'nextClass','average','pendingTasks','teacher_id','teacher_name'
 * ]
 */
type SubjectOffering = {
  id: number;
  name: string;
  section: string;
  grade: string | number;
  room_number?: string;
  schedule?: string | null;
  students: number;
  nextClass?: string | null;
  average?: number | null;
  pendingTasks?: number | null; // (you later said this is quiz count in UI)
  teacher_id?: number | null;
  teacher_name?: string | null;
};

type Quiz = {
  id: number;
  title: string;
  status?: QuizStatus;
  open_time?: string | null;
  close_time?: string | null;
  posted_at?: string | null;
  total_points?: number;
};

type RecentQuizGrade = {
  student: string;
  quiz: string;
  score: number;
  total: number;
  percent: number; // 0-100
  submitted_at?: string;
};

type AnalyticsRow = {
  id: number;
  subjectOffering: string;      // ✅ renamed from subject -> subjectOffering
  average: number;              // %
  participation: number;        // %
  trend: string;                // placeholder
  highest: number;              // %
  status: "Exceling" | "On Track" | "Needs Review";
  scoreDistribution: number[];  // [90-100, 80-89, 70-79, 60-69, <60]
};

function statusFromAverage(avg: number): AnalyticsRow["status"] {
  if (avg >= 90) return "Exceling";
  if (avg >= 80) return "On Track";
  return "Needs Review";
}

function distributionFromPercents(percents: number[]) {
  const buckets = [0, 0, 0, 0, 0];
  for (const p of percents) {
    if (p >= 90) buckets[0] += 1;
    else if (p >= 80) buckets[1] += 1;
    else if (p >= 70) buckets[2] += 1;
    else if (p >= 60) buckets[3] += 1;
    else buckets[4] += 1;
  }
  return buckets;
}

export default function SubjectAnalytics() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // ✅ Use SubjectOfferingViewSet list -> SubjectOfferingSerializer
        const offeringsRes = await fetch(`${base}/subject-offerings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!offeringsRes.ok) {
          const err = await offeringsRes.json().catch(() => ({}));
          console.error("subject-offerings failed", err);
          setErrorMsg("Failed to load subject offerings.");
          setRows([]);
          return;
        }

        const offerings = (await offeringsRes.json()) as SubjectOffering[];
        if (!Array.isArray(offerings) || offerings.length === 0) {
          setRows([]);
          return;
        }

        // Load quizzes + recent grades per offering (best effort)
        const analytics = await Promise.all(
          offerings.map(async (o): Promise<AnalyticsRow> => {
            const [quizzesRes, recentRes] = await Promise.all([
              fetch(`${base}/subject-offerings/${o.id}/quizzes/`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              fetch(`${base}/subject-offerings/${o.id}/recent-quiz-grades/`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

            const quizzes: Quiz[] = quizzesRes.ok
              ? ((await quizzesRes.json()) as Quiz[])
              : [];

            const recent: RecentQuizGrade[] = recentRes.ok
              ? ((await recentRes.json()) as RecentQuizGrade[])
              : [];

            const percents = recent
              .map((r) => Number(r.percent || 0))
              .filter((n) => !Number.isNaN(n));

            const avgFromBackend =
              typeof o.average === "number" ? o.average : null;

            const avgFromRecent =
              percents.length > 0
                ? percents.reduce((a, b) => a + b, 0) / percents.length
                : 0;

            const average = avgFromBackend ?? avgFromRecent;
            const highest = percents.length > 0 ? Math.max(...percents) : 0;

            const uniqueStudents = new Set(recent.map((r) => r.student)).size;
            const totalStudents = Number(o.students || 0);
            const participation =
              totalStudents > 0
                ? Math.min(100, (uniqueStudents / totalStudents) * 100)
                : 0;

            const scoreDistribution = distributionFromPercents(percents);

            // ✅ Subject Offering label from serializer fields
            const label = `${o.name} •  ${o.grade} — ${o.section}`;

            return {
              id: o.id,
              subjectOffering: label,
              average: Number.isFinite(average) ? Number(average.toFixed(1)) : 0,
              participation: Number.isFinite(participation)
                ? Number(participation.toFixed(0))
                : 0,
              trend: "—",
              highest: Number.isFinite(highest) ? Number(highest.toFixed(0)) : 0,
              status: statusFromAverage(average || 0),
              scoreDistribution,
            };
          })
        );

        setRows(analytics);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading analytics.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  const globalAverage = useMemo(() => {
    if (rows.length === 0) return 0;
    const avg = rows.reduce((acc, r) => acc + r.average, 0) / rows.length;
    return Number(avg.toFixed(1));
  }, [rows]);

  if (loading) {
    return (
      <div className="bg-slate-50/50 min-h-screen p-6 font-sans">
        <div className="max-w-screen mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Academic Analytics</h1>
          <p className="text-slate-500 text-sm font-medium">Loading from backend…</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-slate-50/50 min-h-screen p-6 font-sans">
        <div className="max-w-screen mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Academic Analytics</h1>
          <p className="text-rose-600 text-sm font-bold">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen p-1 font-sans">
      <div className="max-w-screen mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Academic Analytics
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Insights from your Subject Offerings (teacher view).
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Target size={24} />
              </div>
              <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <ChevronUp size={14} /> —
              </span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
              Global Average
            </p>
            <h3 className="text-3xl font-black text-slate-900">{globalAverage}%</h3>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">
            Subject Offering Performance
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {rows.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all group"
              >
                <div className="p-8 flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/4 border-r border-slate-100 pr-8">
                    <span
                      className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded mb-4 inline-block ${
                        s.status === "Exceling"
                          ? "bg-emerald-50 text-emerald-600"
                          : s.status === "Needs Review"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {s.status}
                    </span>

                    <h3 className="text-xl font-black text-slate-900 mb-2">
                      {s.subjectOffering}
                    </h3>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">{s.average}%</span>
                      <span className="text-xs font-bold text-slate-400">{s.trend}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">Highest Score: {s.highest}%</p>
                  </div>

                  <div className="lg:w-2/4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      Grade Distribution (Recent)
                    </p>
                    <div className="flex items-end gap-2 h-24">
                      {s.scoreDistribution.map((count, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-slate-100 rounded-t-lg group-hover:bg-indigo-100 transition-all relative overflow-hidden"
                            style={{
                              height: `${Math.min(
                                100,
                                (count / Math.max(1, Math.max(...s.scoreDistribution))) * 100
                              )}%`,
                            }}
                            title={`${count} students`}
                          >
                            <div className="absolute bottom-0 w-full bg-indigo-500 opacity-20" style={{ height: "100%" }} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">
                            {["A", "B", "C", "D", "F"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-1/4 bg-slate-50/50 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Participation</span>
                        <span className="text-xs font-black text-slate-900">{s.participation}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${s.participation}%` }} />
                      </div>
                      <div className="pt-2">
                        <button className="w-full py-2 bg-white border border-slate-200 text-xs font-black text-slate-700 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          Detailed Subject Offering Report
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        * Participation based on recent quiz attempts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {rows.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-600">
                No subject offerings found.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
