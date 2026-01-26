import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Plus, ChevronDown, FileQuestion, Calendar, Trash2 } from "lucide-react";

type ActivityType = "QUIZ";

type ActivityItem = {
  type: ActivityType;
  id: number;
  title: string;
  description?: string;
  date?: string | null;
  status?: string;
  total_points?: number;
};

type QuizApiItem = {
  id: number;
  title: string;
  description?: string;
  open_time?: string | null;
  close_time?: string | null;
  status?: string;
  total_points?: number;
  SubjectOffering?: number;
};

function typeMeta(_type: ActivityType) {
  return { label: "Quiz", icon: FileQuestion, pill: "bg-amber-100 text-amber-700" };
}

function getToken(): string | null {
  const savedUser = localStorage.getItem("user");
  try {
    return savedUser ? JSON.parse(savedUser).token : null;
  } catch {
    return null;
  }
}

export default function SubjectActivitiesTab() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<ActivityType, ActivityItem[]> = { QUIZ: [] };
    for (const x of items) g[x.type].push(x);

    g.QUIZ.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    return g;
  }, [items]);

  const fetchActivities = async () => {
    if (!subjectId) return;

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get<QuizApiItem[]>("http://127.0.0.1:8000/api/teacher/quizzes/", { headers });

      const quizItems: ActivityItem[] = (res.data || [])
        .filter((q) => q.SubjectOffering === subjectId)
        .map((q) => ({
          type: "QUIZ",
          id: q.id,
          title: q.title,
          description: q.description,
          date: q.open_time ?? null,
          status: q.status,
          total_points: q.total_points,
        }));

      setItems(quizItems);
    } catch (e) {
      console.error("Failed to fetch activities", e);
      setError("Failed to load activities for this subject.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const deleteQuizActivity = async (activityId: number) => {
    if (!confirm("Delete this activity?")) return;

    try {
      const token = getToken();
      await axios.delete(`http://127.0.0.1:8000/api/teacher/quizzes/${activityId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems((prev) => prev.filter((x) => x.id !== activityId));
    } catch (e) {
      console.error("Failed to delete activity", e);
      alert("Failed to delete activity");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Activities
        </h2>

        {/* ✅ Direct Create Quiz button (no dropdown) */}
        <Link
          to={`/teacher/subject/${subjectId}/activities/create`}
          className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Create Quiz
        </Link>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-slate-600">
          Loading activities...
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
          {error}
        </div>
      )}

      {/* Grouped sections */}
      {!loading && !error && (
        <div className="flex flex-col gap-8">
          <div className="lg:col-span-8 space-y-6">
            {(Object.keys(grouped) as ActivityType[]).map((t) => {
              const meta = typeMeta(t);
              const Icon = meta.icon;

              return (
                <div
                  key={t}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
                >
            

                  {/* Empty state */}
                  {grouped[t].length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
                        <Icon size={20} />
                      </div>
                      <div className="mt-3 font-bold text-slate-900">
                        No {meta.label.toLowerCase()}s yet
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Create one using the button above.
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {grouped[t].map((a) => (
                        <div
                          key={a.id}
                          className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                                <Icon size={16} />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    to={`/teacher/activities/${a.id}`}
                                    className="font-black text-slate-900 truncate hover:underline"
                                    title={a.title}
                                  >
                                    {a.title}
                                  </Link>

                                  <span
                                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${meta.pill}`}
                                  >
                                    {meta.label}
                                  </span>

                                  {a.status ? (
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                      {a.status}
                                    </span>
                                  ) : null}
                                </div>

                                {a.description ? (
                                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                    {a.description}
                                  </p>
                                ) : null}

                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                  <span className="inline-flex items-center gap-2">
                                    <Calendar size={14} />
                                    {a.date ? new Date(a.date).toLocaleString() : "No date"}
                                  </span>

                                  {typeof a.total_points === "number" ? (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                                      {a.total_points} pts
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => deleteQuizActivity(a.id)}
                              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

  );
}
