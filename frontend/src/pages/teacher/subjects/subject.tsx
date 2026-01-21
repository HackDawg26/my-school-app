import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Users, BarChart, Plus, AlertCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

/* ---------- Types ---------- */
interface SubjectOffering {
  id: number;
  name: string;
  section: string;
  grade: string;
  room_number: string;
  schedule: string;
  students: number;
  average: number;
  pendingTasks: number;
}

/* ---------- Component ---------- */
export default function SubjectListPage() {
  const [offerings, setOfferings] = useState<SubjectOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = localStorage.getItem("access");

  /* ---------- Fetch Subject Offerings ---------- */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/subject-offerings/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOfferings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  /* ---------- Delete ---------- */
  const handleDelete = async (id: number) => {
    if (!token) return alert("Not authenticated");

    const ok = window.confirm("Delete this subject offering? This cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await fetch(`http://127.0.0.1:8000/api/subject-offerings/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Delete failed:", err);
        alert("Failed to delete offering");
        return;
      }

      // remove from UI
      setOfferings((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      console.error(e);
      alert("Network error while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Loading / Empty States ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Loading subject offerings...
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-500 text-lg">No subject offerings assigned yet</p>
        <Link
          to="/teacher/subject/create-subject"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Create Subject Offering
        </Link>
      </div>
    );
  }

  /* ---------- Computed Stats ---------- */
  const totalClasses = offerings.length;
  const totalStudents = offerings.reduce((sum, o) => sum + o.students, 0);

  /* ---------- Render ---------- */
  return (
    <section className="bg-slate-50 min-h-screen p-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black">Subject Offerings</h1>
          <p className="text-slate-500">Manage your assigned subject offerings</p>
        </div>

        <Link
          to="/teacher/subject/create-subject"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow"
        >
          <Plus size={18} />
          New Offering
        </Link>
      </header>

      {/* Summary */}
      <div className="mb-6 text-slate-600">
        <strong>{totalClasses}</strong> offerings • <strong>{totalStudents}</strong>{" "}
        students
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offerings.map((o) => (
          <Link
            key={o.id}
            to={`/teacher/subject/${o.id}`}
            className="bg-white border rounded-2xl p-4 hover:shadow-xl transition relative group"
          >
            {/* Top Row: Title + Icons */}
            <div className="flex justify-between mb-2 items-start gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold truncate">{o.name}</h3>
                <p className="text-sm text-slate-400 uppercase truncate">
                  {o.grade} • Section {o.section}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="text-indigo-500" />

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); // stop Link navigation
                    e.stopPropagation();
                    handleDelete(o.id);
                  }}
                  disabled={deletingId === o.id}
                  className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 disabled:opacity-60"
                  title="Delete offering"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Room & Schedule */}
            <div className="bg-slate-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-slate-400 uppercase">Room</span>
                <p className="font-semibold">{o.room_number}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Schedule</span>
                <p className="font-semibold">{o.schedule}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  Students
                </span>
                <strong>{o.students}</strong>
              </div>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <BarChart size={16} />
                  Average
                </span>
                <strong className={o.average < 85 ? "text-rose-500" : "text-emerald-600"}>
                  {o.average}%
                </strong>
              </div>

              <div className="flex justify-between text-sm text-amber-700">
                <span className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  Pending
                </span>
                <strong>{o.pendingTasks}</strong>
              </div>
            </div>

            {deletingId === o.id && (
              <div className="mt-3 text-xs text-slate-500">Deleting...</div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
