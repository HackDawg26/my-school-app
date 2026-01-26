import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  FileQuestion,
  PenTool,
  GraduationCap,
  Calendar,
  Trash2,
} from "lucide-react";

type ActivityType = "QUIZ" | "ASSIGNMENT" | "EXAM";

type ActivityItem = {
  type: ActivityType;
  id: number;
  title: string;
  description?: string;
  date?: string | null; // ISO string later
  status?: string;
  total_points?: number;
};

function typeMeta(type: ActivityType) {
  if (type === "QUIZ") return { label: "Quiz", icon: FileQuestion, pill: "bg-amber-100 text-amber-700" };
  if (type === "EXAM") return { label: "Exam", icon: GraduationCap, pill: "bg-rose-100 text-rose-700" };
  return { label: "Assignment", icon: PenTool, pill: "bg-blue-100 text-blue-700" };
}

export default function SubjectActivitiesTab() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ✅ UI-first mock data (replace with API later)
  const [items, setItems] = useState<ActivityItem[]>([
    { type: "QUIZ", id: 101, title: "Chapter 1 Quiz", description: "Basic concepts", date: "2026-01-27T08:00:00Z", status: "SCHEDULED", total_points: 20 },
    { type: "ASSIGNMENT", id: 201, title: "Worksheet #1", description: "Practice problems", date: "2026-01-30T12:00:00Z", status: "ASSIGNED", total_points: 50 },
    { type: "EXAM", id: 301, title: "Midterm Exam", description: "Coverage: Weeks 1–4", date: "2026-02-05T01:00:00Z", status: "SCHEDULED", total_points: 100 },
  ]);

  const grouped = useMemo(() => {
    const g: Record<ActivityType, ActivityItem[]> = { QUIZ: [], ASSIGNMENT: [], EXAM: [] };
    items.forEach((x) => g[x.type].push(x));
    (Object.keys(g) as ActivityType[]).forEach((k) =>
      g[k].sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    );
    return g;
  }, [items]);

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Activities</h2>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((s) => !s)}
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700"
          >
            <Plus size={18} className="mr-2" />
            Create
            <ChevronDown size={16} className={`ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
              <Link
                to="/teacher/quiz/create"
                className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FileQuestion size={18} className="mr-3 text-amber-600" />
                Quiz
              </Link>

              {/* ready for later: make pages for assignment/exam create */}
              <Link
                to={`/teacher/subject/${subjectId}/assignment/create`}
                className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-t"
                onClick={() => setIsDropdownOpen(false)}
              >
                <PenTool size={18} className="mr-3 text-blue-600" />
                Assignment
              </Link>

              <Link
                to={`/teacher/subject/${subjectId}/exam/create`}
                className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-t"
                onClick={() => setIsDropdownOpen(false)}
              >
                <GraduationCap size={18} className="mr-3 text-rose-600" />
                Exam
              </Link>

            </div>
          )}
        </div>
      </div>

      {/* Grouped sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {(Object.keys(grouped) as ActivityType[]).map((t) => {
            const meta = typeMeta(t);
            const Icon = meta.icon;
            return (
              <div key={t} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{meta.label}s</div>
                      <div className="text-xs text-slate-500">{grouped[t].length} item(s)</div>
                    </div>
                  </div>
                </div>

                {grouped[t].length === 0 ? (
                  <div className="px-6 pb-6 text-slate-600">No {meta.label.toLowerCase()}s yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {grouped[t].map((a) => (
                      <div key={a.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-900 truncate">{a.title}</div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${meta.pill}`}>
                              {meta.label}
                            </span>
                            {a.status ? (
                              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                {a.status}
                              </span>
                            ) : null}
                          </div>

                          {a.description ? (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                          ) : null}

                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={14} />
                            <span>
                              {a.date ? new Date(a.date).toLocaleString() : "No date"}
                            </span>
                            {typeof a.total_points === "number" ? (
                              <span>• {a.total_points} pts</span>
                            ) : null}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteItem(a.id)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"
                          title="Delete (UI only for now)"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right panel (future: filters, upcoming, stats) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Coming next</div>
            <ul className="mt-3 text-sm text-slate-600 space-y-2">
              <li>• Filter by type (Quiz/Assignment/Exam)</li>
              <li>• “Upcoming” sidebar</li>
              <li>• Hook this page to: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/activities/</code></li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="text-sm font-black text-slate-900 uppercase tracking-widest">API Ready</div>
            <p className="mt-3 text-sm text-slate-600">
              Later, replace mock data with:
              <br />
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                GET /api/subject-offerings/{subjectId}/activities/
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
