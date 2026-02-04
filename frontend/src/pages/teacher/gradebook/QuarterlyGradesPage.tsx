import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Subject {
  id: number;
  name: string;
  section?: string;
  grade?: string;
  room_number?: string;
  schedule?: string;
  nextClass?: string;
  teacher_name?: string;
  average?: number;
  pendingTasks?: number;
  students?: number;
}

function prettyGrade(g?: string) {
  return g ? g.replaceAll("_", " ") : "—";
}

function getToken() {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser).token : null;
}

export default function QuarterlyGradesPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const res = await axios.get("http://127.0.0.1:8000/api/subject-offerings/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return subjects;

    return subjects.filter((s) => {
      const hay = `${s.name} ${prettyGrade(s.grade)} ${s.section ?? ""} ${s.room_number ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [subjects, q]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Quarterly Grades Management
          </h1>
          <p className="text-sm text-slate-600">Select a subject to manage quarterly grades</p>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subjects (e.g., Math, Grade 7, Gold)…"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
              Loading subjects…
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
              No subjects found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => navigate(`/teacher/grades/quarterly/${subject.id}`,
                    {state: { subjectName: subject.name }}
                  )}
                  className="group w-full text-left rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                      <BookOpen size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-black text-slate-900 truncate">{subject.name}</h3>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                            {prettyGrade(subject.grade)} • Section {subject.section ?? "—"}
                          </p>
                          {subject.room_number ? (
                            <p className="mt-1 text-xs text-slate-500">Room {subject.room_number}</p>
                          ) : null}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Average
                          </div>
                          <div className="mt-1 text-lg font-black text-indigo-600">
                            {typeof subject.average === "number" ? subject.average.toFixed(2) : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {typeof subject.students === "number" ? (
                            <span className="font-bold text-slate-700">{subject.students}</span>
                          ) : (
                            "—"
                          )}{" "}
                          students
                          {typeof subject.pendingTasks === "number" ? (
                            <>
                              {" "}
                              • <span className="font-bold text-slate-700">{subject.pendingTasks}</span> pending
                            </>
                          ) : null}
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-indigo-600">
                          Manage <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 mb-3">
            About Quarterly Grades
          </h3>
          <ul className="text-sm text-indigo-900/90 space-y-2">
            <li>
              • <strong>Written Work:</strong> Homework, seatwork, quizzes
            </li>
            <li>
              • <strong>Performance Tasks:</strong> Projects, group work, practical activities
            </li>
            <li>
              • <strong>Quarterly Assessment:</strong> Major exams and assessments
            </li>
            <li>• Final grade is automatically calculated based on weighted components</li>
            <li>• Each quarter (Q1 - Q4) is tracked separately</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
