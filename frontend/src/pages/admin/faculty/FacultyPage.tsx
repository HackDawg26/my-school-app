import { ArrowRight, FolderPlus, Users, X, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Subject {
  id: number;
  name: string;
  faculty_count: number;
}

export const FacultyPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/subjects/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Failed to load subjects", err));
  }, [token]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Not authenticated");

    const res = await fetch("http://127.0.0.1:8000/api/subjects/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newSubjectName }),
    });

    if (!res.ok) {
      alert("Failed to create subject");
      return;
    }

    const created = await res.json();
    setSubjects((prev) => [...prev, created]);

    setIsSubjectModalOpen(false);
    setNewSubjectName("");
  };

  const handleDeleteSubject = async (id: number) => {
    if (!token) return alert("Not authenticated");

    const ok = window.confirm("Delete this subject/department? This cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await fetch(`http://127.0.0.1:8000/api/subjects/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete subject");
        return;
      }

      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Network error while deleting subject");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1 p-2">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Faculty Accounts</h1>
          <p className="text-slate-500">Select a department to view and manage faculty accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm"
          >
            <FolderPlus size={18} className="text-indigo-600" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSubjectModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Create New Subject</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Social Studies"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
          >
            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSubject(subject.id);
              }}
              disabled={deletingId === subject.id}
              title="Delete subject"
              className="absolute top-4 right-4 p-2 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            >
              <Trash2 size={18} />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-xl font-bold text-slate-800">{subject.name}</h2>
              <p className="text-sm text-slate-400">Department</p>
            </div>

            <div className="flex items-center gap-2 text-slate-600 mb-6">
              <Users size={18} className="text-slate-400" />
              <span>{subject.faculty_count} Faculty</span>
            </div>

            <div className="flex justify-end">
              <Link
                to={`/admin/faculty/${subject.id}`}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
              >
                View Faculty List
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {deletingId === subject.id && <div className="mt-3 text-xs text-slate-500">Deleting...</div>}
          </div>
        ))}
      </div>
    </main>
  );
};
