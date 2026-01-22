import { useEffect, useState } from "react";
import { ArrowLeft, MoreHorizontal, UserPlus, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AddTeacherModal from "./AddTeacherModal";

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  advisory: string | null;
}

interface Subject {
  id: number;
  name: string;
}

export const FacultyList = () => {
  const { department } = useParams();
  const subjectId = Number(department);
  const token = localStorage.getItem("access");

  const [subject, setSubject] = useState<Subject | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  /* ---------------- FETCH SUBJECT ---------------- */
  useEffect(() => {
    if (!token || !subjectId) return;

    fetch(`http://127.0.0.1:8000/api/subjects/${subjectId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setSubject)
      .catch(() => setSubject(null));
  }, [subjectId, token]);

  /* ---------------- FETCH ASSIGNED TEACHERS ---------------- */
  useEffect(() => {
    if (!token || !subjectId) return;

    fetch(`http://127.0.0.1:8000/api/subjects/${subjectId}/teachers/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setTeachers)
      .catch((err) => console.error("Failed to load assigned teachers", err));
  }, [subjectId, token]);

  /* ---------------- FETCH AVAILABLE TEACHERS ---------------- */
  useEffect(() => {
    if (!token) return;

    fetch(`http://127.0.0.1:8000/api/teachers/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setAvailableTeachers)
      .catch((err) => console.error("Failed to load teachers", err));
  }, [token]);

  /* ---------------- ASSIGN TEACHER ---------------- */
  const handleAssignTeacher = async (teacherId: number) => {
    if (!token) return alert("Not authenticated");

    const res = await fetch(
      `http://127.0.0.1:8000/api/subjects/${subjectId}/assign-teacher/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      }
    );

    if (!res.ok) return alert("Failed to assign teacher");

    const assigned: Teacher = await res.json();

    setTeachers((prev) => [...prev, assigned]);
    setAvailableTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    setIsModalOpen(false);
  };

  /* ---------------- REMOVE TEACHER FROM SUBJECT ---------------- */
  const handleRemove = async (teacherId: number) => {
    if (!token) return alert("Not authenticated");

    const res = await fetch(
      `http://127.0.0.1:8000/api/subjects/${subjectId}/remove-teacher/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      }
    );

    if (!res.ok) return alert("Failed to remove teacher");

    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    setOpenMenuId(null);

    // Optional: put them back into available list (only if your API expects this UX)
    // const removedTeacher = teachers.find(t => t.id === teacherId);
    // if (removedTeacher) setAvailableTeachers(prev => [...prev, removedTeacher]);
  };

  if (!subject) {
    return <div className="p-10 text-center font-bold">Subject not found</div>;
  }

  return (
    <div className="flex-1 p-6 bg-slate-50 min-h-screen relative">
      {/* Navigation & Header */}
      <Link
        to="/admin/faculty"
        className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group text-sm font-medium"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to All Departments
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {subject.name} Department
          </h1>
          <p className="text-slate-500 text-sm">Manage faculty members for this department.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md shadow-indigo-100"
        >
          <UserPlus size={18} />
          Add Faculty Member
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-hidden min-h-screen">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
              <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
              <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Advisory Class</th>
              <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {teachers.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-700">{faculty.last_name}</span>, {faculty.first_name}
                </td>
                <td className="px-8 py-5 text-slate-500 text-sm">{faculty.email}</td>
                <td className="px-8 py-5">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      faculty.advisory === "N/A" || faculty.advisory === null
                        ? "bg-slate-100 text-slate-400"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {faculty.advisory ?? "N/A"}
                  </span>
                </td>

                <td className="px-8 py-5 text-right relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === faculty.id ? null : faculty.id)}
                    className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
                  >
                    <MoreHorizontal size={20} className="text-slate-400" />
                  </button>

                  {openMenuId === faculty.id && (
                    <div>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => handleRemove(faculty.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          <Trash2 size={14} /> Remove Account
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teachers={availableTeachers}
        onSelect={handleAssignTeacher}
      />
    </div>
  );
};
