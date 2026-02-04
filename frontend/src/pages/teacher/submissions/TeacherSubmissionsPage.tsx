import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type SummaryTotals = {
  overall_attempts: number;
  overall_unique_students: number;
  overall_quizzes: number;
  overall_subject_offerings: number;
};

type SubjectRow = {
  subject_offering_id: number;
  subject: string;
  submitted_attempts: number;   // total attempts (can be > unique students)
  unique_students: number;      // students who attempted at least once
  total_students: number;       // total enrolled
  submission_rate: number;      // backend value (we won't rely on this)
};

function getToken(): string | null {
  const savedUser = localStorage.getItem("user");
  try {
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

const safePct = (num: number, den: number) => {
  if (!den || den <= 0) return 0;
  return Math.round((num / den) * 100);
};

export default function TeacherSubmissionsPage() {
  const base = "http://127.0.0.1:8000/api";
  const [view, setView] = useState<"BY_SUBJECT" | "TOTALS">("BY_SUBJECT");
  const [totals, setTotals] = useState<SummaryTotals | null>(null);
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setErrorMsg("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await axios.get(`${base}/teacher/submissions/summary/`, { headers });

        setTotals(res.data?.totals ?? null);
        setRows(Array.isArray(res.data?.by_subject) ? res.data.by_subject : []);
      } catch (e: any) {
        setErrorMsg("Failed to load submissions summary.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Export: students who attempted + total students per subject (+ attempts)
  const downloadSubjectTotalsCsv = () => {
    const headers = [
      "subject_offering_id",
      "subject",
      "attempted_students",
      "total_students",
      "submission_rate_pct",
      "submitted_attempts",
    ];

    const lines = rows.map((r) => {
      const attempted = r.unique_students ?? 0;
      const total = r.total_students ?? 0;
      const pct = safePct(attempted, total);
      const attempts = r.submitted_attempts ?? 0;

      const values = [r.subject_offering_id, r.subject, attempted, total, pct, attempts];

      return values
        .map((v) => {
          const s = String(v ?? "");
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(",");
    });

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "submissions_by_subject_totals.csv";
    a.click();
    window.URL.revokeObjectURL(a.href);
  };

  // Optional: export overall totals too (nice to have)
  const downloadOverallTotalsCsv = () => {
    const t = totals;
    if (!t) return;

    const headers = ["overall_attempts", "overall_unique_students", "overall_quizzes", "overall_subject_offerings"];
    const values = [t.overall_attempts, t.overall_unique_students, t.overall_quizzes, t.overall_subject_offerings];

    const csv = `${headers.join(",")}\n${values.join(",")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "submissions_overall_totals.csv";
    a.click();
    window.URL.revokeObjectURL(a.href);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading submissions…</div>;
  }

  if (errorMsg) {
    return <div className="p-10 text-center text-red-600">{errorMsg}</div>;
  }

  return (
    <section className="flex flex-col bg-slate-50/30 min-h-screen p-6 font-sans">
      <div className="mx-auto w-full max-w-screen space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
            <p className="text-sm text-gray-600">
              Students who attempted quizzes (unique) + attempt counts, grouped per subject.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView("BY_SUBJECT")}
              className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                view === "BY_SUBJECT" ? "bg-slate-900 text-white" : "bg-white text-slate-700"
              }`}
            >
              By Subject
            </button>

            <button
              onClick={() => setView("TOTALS")}
              className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                view === "TOTALS" ? "bg-slate-900 text-white" : "bg-white text-slate-700"
              }`}
            >
              Totals
            </button>

            <button
              onClick={downloadSubjectTotalsCsv}
              className="px-3 py-2 rounded-lg text-sm font-bold border bg-white hover:bg-gray-50"
              title="Exports attempted students + total students per subject"
            >
              Export CSV (Subject Totals)
            </button>

            <button
              onClick={downloadOverallTotalsCsv}
              className="px-3 py-2 rounded-lg text-sm font-bold border bg-white hover:bg-gray-50"
              disabled={!totals}
              title="Exports overall totals"
            >
              Export CSV (Overall)
            </button>
          </div>
        </div>

        {view === "TOTALS" && totals ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Overall Attempts" value={totals.overall_attempts} />
            <Card title="Unique Students" value={totals.overall_unique_students} />
            <Card title="Total Quizzes" value={totals.overall_quizzes} />
            <Card title="Subject Offerings" value={totals.overall_subject_offerings} />
          </div>
        ) : null}

        {view === "BY_SUBJECT" ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Attempts per Subject
            </h2>

            {rows.map((r) => {
              // ✅ FIX: indicator should be attempted / total_students (not vs max of other subjects)
              const attempted = r.unique_students ?? 0;
              const total = r.total_students ?? 0;
              const pct = safePct(attempted, total);

              return (
                <div key={r.subject_offering_id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-bold text-slate-800 truncate">{r.subject}</div>

                    <div className="text-xs text-slate-500">
                      Attempted: {attempted}/{total} • {pct}%
                      <span className="ml-2 text-slate-400">Attempts: {r.submitted_attempts ?? 0}</span>
                    </div>

                    <Link
                      className="text-xs font-bold text-indigo-600 hover:underline"
                      to={`/teacher/submissions/${r.subject_offering_id}`}
                    >
                      View per quiz →
                    </Link>
                  </div>

                  <div className="col-span-12 md:col-span-9">
                    <div className="h-10 w-full rounded-xl bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-xl bg-[hsl(217,81%,37%)]"
                        style={{ width: `${pct}%` }}
                        aria-label={`Submission rate ${pct}%`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {rows.length === 0 ? <div className="text-sm text-slate-600">No data yet.</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
