import { useEffect, useState } from "react";
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

type SubmissionRow = {
  attempt_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  submitted_at: string;
  score: number;
  status: string;
};

function getToken(): string | null {
  const savedUser = localStorage.getItem("user");
  try {
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

/**
 * Deduplicate by student_id, keeping the HIGHEST score.
 * If scores tie, keep the most recently submitted.
 */
function uniqueByStudentHighestScore(rows: SubmissionRow[]) {
  const map = new Map<number, SubmissionRow>();

  for (const r of rows) {
    const prev = map.get(r.student_id);
    if (!prev) {
      map.set(r.student_id, r);
      continue;
    }

    const prevScore = Number.isFinite(prev.score) ? prev.score : 0;
    const currScore = Number.isFinite(r.score) ? r.score : 0;

    if (currScore > prevScore) {
      map.set(r.student_id, r);
      continue;
    }

    if (currScore === prevScore) {
      const prevTime = new Date(prev.submitted_at).getTime();
      const currTime = new Date(r.submitted_at).getTime();
      if (currTime > prevTime) map.set(r.student_id, r);
    }
  }

  // Sort: highest score first; if tie, latest submission first
  return Array.from(map.values()).sort((a, b) => {
    const sa = Number.isFinite(a.score) ? a.score : 0;
    const sb = Number.isFinite(b.score) ? b.score : 0;
    if (sb !== sa) return sb - sa;
    return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  });
}

export default function TeacherSubjectSubmissionsPage() {
  const { subjectOfferingId } = useParams<{ subjectOfferingId: string }>();
  const id = Number(subjectOfferingId || 0);
  const base = "http://127.0.0.1:8000/api";

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [openQuizId, setOpenQuizId] = useState<number | null>(null);
  const [quizSubs, setQuizSubs] = useState<Record<number, SubmissionRow[]>>({});
  const [subsLoadingQuizId, setSubsLoadingQuizId] = useState<number | null>(null);
  const [subsError, setSubsError] = useState<string | null>(null);

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

  const loadQuizSubmissions = async (quizId: number) => {
    const token = getToken();
    if (!token) return;

    if (quizSubs[quizId]) return;

    setSubsError(null);
    setSubsLoadingQuizId(quizId);

    try {
      // Submitted + graded attempts
      const res = await axios.get<SubmissionRow[]>(
        `${base}/teacher/quizzes/${quizId}/student_answers/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuizSubs((prev) => ({ ...prev, [quizId]: res.data || [] }));
    } catch {
      setSubsError("Failed to load submitted students for this quiz.");
    } finally {
      setSubsLoadingQuizId(null);
    }
  };

  const toggleQuiz = async (quizId: number) => {
    if (openQuizId === quizId) {
      setOpenQuizId(null);
      setSubsError(null);
      return;
    }
    setOpenQuizId(quizId);
    await loadQuizSubmissions(quizId);
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
              Unique students: {data.totals.unique_students}/{data.total_students} •{" "}
              {data.totals.submission_rate}% • Attempts: {data.totals.attempts}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Quizzes</div>
            <div className="text-xs text-slate-500 mt-1">
              Click a quiz to see submitted students (deduped by student, highest score shown)
            </div>
          </div>

          {data.quizzes.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No quizzes yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.quizzes.map((q) => {
                const isOpen = openQuizId === q.quiz_id;

                const rawSubs = quizSubs[q.quiz_id] || [];
                const subs = uniqueByStudentHighestScore(rawSubs);

                const isSubsLoading = subsLoadingQuizId === q.quiz_id;

                return (
                  <div key={q.quiz_id}>
                    <button
                      type="button"
                      onClick={() => void toggleQuiz(q.quiz_id)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{q.title}</div>
                        <div className="text-xs text-slate-500">Status: {q.status}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">Attempts: {q.attempts}</div>
                        <div className="text-xs text-slate-500">Unique Students: {q.unique_students}</div>
                        <div className="text-xs text-indigo-600 font-bold mt-1">
                          {isOpen ? "Hide students ▲" : "View students ▼"}
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
                        {isSubsLoading && <div className="text-sm text-slate-600">Loading students…</div>}

                        {!isSubsLoading && subsError && (
                          <div className="text-sm text-red-600">{subsError}</div>
                        )}

                        {!isSubsLoading && !subsError && subs.length === 0 && (
                          <div className="text-sm text-slate-600">No submissions yet.</div>
                        )}

                        {!isSubsLoading && !subsError && subs.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                Submitted Students ({subs.length})
                              </div>

                              {/* ✅ matches your route: /teacher/activities/:id/grading */}
                              <Link
                                to={`/teacher/activities/${q.quiz_id}/grading`}
                                className="text-xs text-indigo-600 font-bold hover:underline"
                              >
                                Open grading →
                              </Link>
                            </div>

                            <div className="divide-y divide-slate-200 rounded-xl bg-white border border-slate-200 overflow-hidden">
                              {subs.map((s) => (
                                <div
                                  key={s.attempt_id}
                                  className="px-4 py-3 flex items-center justify-between gap-4"
                                >
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 truncate">{s.student_name}</div>
                                    <div className="text-xs text-slate-500 truncate">{s.student_email}</div>
                                    <div className="text-xs text-slate-500">
                                      Best attempt submitted: {new Date(s.submitted_at).toLocaleString()}
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className="text-sm font-black text-slate-900">
                                      {(s.score ?? 0).toFixed(1)}
                                    </div>
                                    <div className="text-xs text-slate-500">{s.status}</div>

                                    {/* ✅ matches your route */}
                                    <Link
                                      to={`/teacher/activities/${q.quiz_id}/grading`}
                                      className="text-xs text-indigo-600 font-bold hover:underline"
                                    >
                                      Grade →
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
