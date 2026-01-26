import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

type Detail = {
  subject_offering_id: number;
  subject: string;
  total_students: number;
  totals: { attempts: number; unique_students: number; submission_rate: number };
  quizzes: Array<{
    quiz_id: number;
    title: string;
    attempts: number;
    unique_students: number;
    status: string;
    open_time?: string;
    close_time?: string;
  }>;
};

function getToken(): string | null {
  const savedUser = localStorage.getItem("user");
  try {
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

export default function TeacherSubjectSubmissionsPage() {
  const { subjectOfferingId } = useParams<{ subjectOfferingId: string }>();
  const id = Number(subjectOfferingId || 0);
  const base = "http://127.0.0.1:8000/api";

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !id) {
      setErrorMsg("Invalid or missing subject offering.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await axios.get<Detail>(`${base}/teacher/submissions/subject/${id}/`, { headers });
        setData(res.data);
      } catch {
        setErrorMsg("Failed to load subject submissions detail.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const downloadCsv = async () => {
    const token = getToken();
    if (!token) return;

    const url = `${base}/teacher/submissions/export.csv?scope=subject&subject_offering_id=${id}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = `submissions_${id}.csv`;
    a.click();
    window.URL.revokeObjectURL(a.href);
  };

  if (loading) return <div className="p-10 text-center">Loading…</div>;
  if (errorMsg) return <div className="p-10 text-center text-red-600">{errorMsg}</div>;
  if (!data) return <div className="p-10 text-center">No data.</div>;

  return (
    <section className="flex flex-col bg-slate-50/30 min-h-screen p-6 font-sans">
      <div className="mx-auto w-full max-w-screen space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/teacher/submissions" className="text-sm font-bold text-indigo-600 hover:underline">
              ← Back to Submissions
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{data.subject}</h1>
            <p className="text-sm text-gray-600">
              Unique students: {data.totals.unique_students}/{data.total_students} • {data.totals.submission_rate}% • Attempts: {data.totals.attempts}
            </p>
          </div>

          <button
            onClick={downloadCsv}
            className="px-3 py-2 rounded-lg text-sm font-bold border bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Quizzes</div>
            <div className="text-xs text-slate-500 mt-1">Attempts and unique students per quiz</div>
          </div>

          {data.quizzes.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No quizzes yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.quizzes.map((q) => (
                <div key={q.quiz_id} className="px-6 py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{q.title}</div>
                    <div className="text-xs text-slate-500">Status: {q.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      Attempts: {q.attempts}
                    </div>
                    <div className="text-xs text-slate-500">
                      Unique Students: {q.unique_students}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
