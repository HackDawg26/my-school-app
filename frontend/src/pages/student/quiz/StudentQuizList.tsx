import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Clock, Filter } from "lucide-react";

interface Quiz {
  id: number;
  quiz_id: string;
  title: string;
  subject_name: string;
  teacher_name: string;
  open_time: string;
  close_time: string;
  time_limit: number;
  total_points: number;
  question_count: number;
  is_open: boolean;
  is_upcoming: boolean;
  is_closed: boolean;
  user_attempts: number;
  allow_multiple_attempts: boolean;
}

interface QuizAttempt {
  id: number;
  quiz: number;
  score: number | null;
  total: number | null;
  percentage: number | null;
  submitted_at?: string;
}

type SubjectOfferingCard = {
  id: number;
  subject_name: string;
};

type Tab = "ALL" | "OPEN" | "UPCOMING" | "CLOSED";

function badge(status: Tab) {
  const cls =
    status === "OPEN"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "UPCOMING"
      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
      : status === "CLOSED"
      ? "bg-slate-50 text-slate-600 border-slate-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return `px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border ${cls}`;
}

function statusOf(q: Quiz): Tab {
  if (q.is_open) return "OPEN";
  if (q.is_upcoming) return "UPCOMING";
  if (q.is_closed) return "CLOSED";
  return "ALL";
}

function fmt(dt?: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function StudentQuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [offerings, setOfferings] = useState<SubjectOfferingCard[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [tab, setTab] = useState<Tab>("ALL");
  const [query, setQuery] = useState("");

  const base = "http://127.0.0.1:8000/api";

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchOfferings(), fetchQuizzes(), fetchAttempts()]);
      setLoading(false);
    })();
  }, []);

  const getToken = () => {
    const access = localStorage.getItem("access");
    if (access) return access;
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser).token : null;
  };

  const fetchOfferings = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${base}/student/subject-offerings/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOfferings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching offerings:", e);
      setOfferings([]);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${base}/student/quizzes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching quizzes:", e);
      setQuizzes([]);
    }
  };

  const fetchAttempts = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${base}/student/quiz-attempts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttempts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching attempts:", e);
      setAttempts([]);
    }
  };

  const allowedSubjects = useMemo(() => {
    return new Set(
      offerings.map((o) => String(o.subject_name || "").trim().toLowerCase()).filter(Boolean)
    );
  }, [offerings]);

  const visibleQuizzes = useMemo(() => {
    return quizzes.filter((q) =>
      allowedSubjects.has(String(q.subject_name || "").trim().toLowerCase())
    );
  }, [quizzes, allowedSubjects]);

  const latestAttemptByQuizId = useMemo(() => {
    const map = new Map<number, QuizAttempt>();
    const sorted = [...attempts].sort((a, b) => {
      const ta = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const tb = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return tb - ta;
    });
    for (const a of sorted) if (!map.has(a.quiz)) map.set(a.quiz, a);
    return map;
  }, [attempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...visibleQuizzes];

    // tab filter
    if (tab !== "ALL") {
      list = list.filter((x) => statusOf(x) === tab);
    }

    // search filter
    if (q) {
      list = list.filter((x) => {
        const hay = `${x.title} ${x.subject_name} ${x.teacher_name}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // sort: soonest close/open first
    list.sort((a, b) => {
      const da = new Date(a.close_time || a.open_time).getTime();
      const db = new Date(b.close_time || b.open_time).getTime();
      return da - db;
    });

    return list;
  }, [visibleQuizzes, tab, query]);

  const canTakeQuiz = (quiz: Quiz) => {
    if (!quiz.is_open) return false;
    if (!quiz.allow_multiple_attempts && quiz.user_attempts > 0) return false;
    return true;
  };

  console.log(quizzes);
  const renderScoreChip = (quiz: Quiz) => {
    const a = latestAttemptByQuizId.get(quiz.id);
    if (!a) return null;

    const score = a.score;
    const total = a.total ?? quiz.total_points;
    const percent =
      a.percentage != null
        ? a.percentage
        : score != null && total
        ? (score / total) * 100
        : null;

    return (
      <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
        {score == null || total == null ? "Last: —" : `Last: ${score}/${total}`}
        {percent == null ? "" : ` (${percent.toFixed(1)}%)`}
      </span>
    );
  };

  if (loading) return <div className="p-8">Loading quizzes...</div>;

  return (
    <div className="p-4  bg-slate-50 min-h-screen">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Activities
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Filter and take quizzes for your enrolled subjects.
            </p>
          </div>
<<<<<<< HEAD
        ) : (
          visibleQuizzes.map((quiz) => {
=======
>>>>>>> student-ui

          {/* Search */}
          <div className="w-full md:w-[380px]">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quiz, subject, teacher…"
                className="w-full outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
            <Filter size={14} /> Status
          </span>

          {(["ALL", "OPEN", "UPCOMING", "CLOSED"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition ${
                tab === t
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-bold">No quizzes match your filters.</p>
            </div>
          ) : (
            filtered.map((quiz) => {
              const s = statusOf(quiz);
              const takeable = canTakeQuiz(quiz);

              return (
                <div
                  key={quiz.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg md:text-xl font-black text-slate-900 truncate">
                          {quiz.title}
                        </h2>
                        <span className={badge(s)}>{s}</span>
                        {renderScoreChip(quiz)}
                      </div>

                      <div className="mt-2 text-sm text-slate-600 space-y-1">
                        <div className="font-bold text-slate-800">
                          {quiz.subject_name} • <span className="text-slate-500">{quiz.teacher_name}</span>
                        </div>
                        <div>
                          Questions: <span className="font-bold">{quiz.question_count}</span> • Points:{" "}
                          <span className="font-bold">{quiz.total_points}</span> • Time:{" "}
                          <span className="font-bold">{quiz.time_limit}m</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                          <Clock size={14} />
                          {quiz.is_upcoming ? `Opens: ${fmt(quiz.open_time)}` : `Closes: ${fmt(quiz.close_time)}`}
                        </span>

                        {quiz.user_attempts > 0 ? (
                          <span className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                            Attempts: {quiz.user_attempts}
                            {!quiz.allow_multiple_attempts ? " (limit reached)" : ""}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Right CTA */}
                    <div className="shrink-0 flex flex-col gap-2 md:items-end">
                      {takeable ? (
                        <Link
                          to={`/student/activities/${quiz.id}/take`}
                          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-indigo-600 text-center"
                        >
                          Take Quiz
                        </Link>
                      ) : quiz.is_upcoming ? (
                        <div className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-black text-sm text-center cursor-not-allowed">
                          Not Yet Open
                        </div>
                      ) : quiz.is_closed ? (
                        <div className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-black text-sm text-center cursor-not-allowed">
                          Closed
                        </div>
                      ) : (
                        <div className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-black text-sm text-center cursor-not-allowed">
                          Taken
                        </div>
                      )}

                      {/* <Link
                        to="/student/activities"
                        className="text-xs font-black text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        View details <span aria-hidden>→</span>
                      </Link> */}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
