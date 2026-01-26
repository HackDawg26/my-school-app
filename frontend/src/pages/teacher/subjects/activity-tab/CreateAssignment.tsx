import React, { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PenTool, Save, Calendar } from "lucide-react";

type AssignmentStatus = "DRAFT" | "ASSIGNED" | "CLOSED";

export default function CreateAssignment() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "", // datetime-local string
    total_points: 100,
    status: "ASSIGNED" as AssignmentStatus,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!subjectId) return alert("Invalid subject offering id.");
    if (!token) return alert("Not authenticated.");
    if (!form.title.trim()) return alert("Title is required.");

    // Convert to ISO if provided
    const dueISO = form.due_date ? new Date(form.due_date).toISOString() : null;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      due_date: dueISO, // backend expects DateTimeField
      total_points: Number(form.total_points || 0),
      status: form.status,
    };

    try {
      setLoading(true);
      const res = await fetch(`${base}/subject-offerings/${subjectId}/assignments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Create assignment failed:", err);
        alert(err?.detail || "Failed to create assignment (backend might not be enabled yet).");
        return;
      }

      alert("Assignment created successfully!");
      navigate(`/teacher/subject/${subjectId}`); // go back to SubjectPage (Activities tab later)
    } catch (e) {
      console.error(e);
      alert("Network error while creating assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to={`/teacher/subject/${subjectId}`}
          className="inline-flex items-center text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Subject
        </Link>

        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <PenTool size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Create Assignment</h1>
              <p className="text-slate-500 text-sm">Add a new assignment under this subject offering.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., Worksheet #1"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
                placeholder="Instructions, requirements, rubric..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Total Points
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.total_points}
                  onChange={(e) => setForm((p) => ({ ...p, total_points: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as AssignmentStatus }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="DRAFT">DRAFT (not visible yet)</option>
                <option value="ASSIGNED">ASSIGNED (visible)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Tip: Use <b>ASSIGNED</b> to show it to students.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save size={18} />
                {loading ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
