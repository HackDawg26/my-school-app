import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, MoreHorizontal, Plus, Mail, Users, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";
import AddAdviserModal from "./AddAdviserModal";

interface Student {
  id: number;
  school_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Section {
  id: number;
  name: string;
  grade_level: string;
  adviser_name: string; // "First Last" or "N/A"
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export const StudentClassList = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const token = localStorage.getItem("access");

  const [students, setStudents] = useState<Student[]>([]);
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdviserModalOpen, setIsAdviserModalOpen] = useState(false);

  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | "">("");

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students
      .filter((s) => {
        if (!q) return true;
        const haystack = `${s.school_id} ${s.first_name} ${s.last_name}`.toLowerCase();
        return haystack.includes(q);
      });
  }, [students, searchQuery]);

  // -------------------
  // Adviser state
  // -------------------
  const adviserLabel = useMemo(() => {
    if (!section?.adviser_name) return "N/A";
    if (section.adviser_name === "N/A") return "N/A";
    if (section.adviser_name.trim() === "") return "N/A";
    return section.adviser_name;
  }, [section]);

  const hasAdviser = adviserLabel !== "N/A";

  // Auto-close adviser modal if adviser exists
  useEffect(() => {
    if (isAdviserModalOpen && hasAdviser) setIsAdviserModalOpen(false);
  }, [hasAdviser, isAdviserModalOpen]);

  // -------------------
  // Fetch Section
  // -------------------
  useEffect(() => {
    if (!sectionId || !token) return;

    const fetchSection = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/sections/${sectionId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Section not found");

        const data = await res.json();
        setSection(data);
      } catch (err) {
        console.error(err);
        setSection(null);
      }
    };

    fetchSection();
  }, [sectionId, token]);

  // -------------------
  // Fetch Students in Section
  // -------------------
  useEffect(() => {
    if (!sectionId || !token) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);

        const res = await fetch(`http://127.0.0.1:8000/api/sections/${sectionId}/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load students");

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [sectionId, token]);

  // -------------------
  // Fetch Available Students (grade_level match, section=null)
  // -------------------
  useEffect(() => {
    if (!token || !section) return;

    fetch(
      `http://127.0.0.1:8000/api/students/?section=null&grade_level=${section.grade_level}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((data) => setAvailableStudents(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e);
        setAvailableStudents([]);
      });
  }, [section, token]);

  // -------------------
  // Fetch Teachers (only needed if no adviser yet)
  // -------------------
  useEffect(() => {
    if (!token) return;
    if (hasAdviser) return; // ✅ prevent fetching if adviser already assigned

    fetch("http://127.0.0.1:8000/api/teachers/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAvailableTeachers(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e);
        setAvailableTeachers([]);
      });
  }, [token, hasAdviser]);

  // -------------------
  // Add MANY students to section
  // -------------------
  const handleAddStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !section || selectedStudentIds.length === 0) return;

    try {
      const results = await Promise.all(
        selectedStudentIds.map(async (id) => {
          const res = await fetch(`http://127.0.0.1:8000/api/students/${id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ section: section.id }),
          });

          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(txt || `Failed to assign student ${id}`);
          }

          return res.json();
        })
      );

      setStudents((prev) => [...prev, ...results]);
      setAvailableStudents((prev) => prev.filter((s) => !selectedStudentIds.includes(s.id)));

      setSelectedStudentIds([]);
      setIsStudentModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to assign one or more students.");
    }
  };

  // -------------------
  // Remove student from section
  // -------------------
  const handleRemoveFromSection = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/students/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section: null }),
      });

      if (!res.ok) throw new Error("Remove failed");

      setStudents((prev) => prev.filter((student) => student.id !== id));

      const removed = students.find((s) => s.id === id);
      if (removed) setAvailableStudents((prev) => [removed, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to remove student from section");
    } finally {
      setOpenMenuId(null);
    }
  };

  // -------------------
  // Assign adviser
  // -------------------
  const handleAssignAdviser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !section || !selectedTeacherId) return;

    const res = await fetch(`http://127.0.0.1:8000/api/sections/${section.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ adviser: selectedTeacherId }),
    });

    if (!res.ok) {
      alert("Failed to assign adviser");
      return;
    }

    const updatedSection = await res.json();
    setSection(updatedSection);
    setIsAdviserModalOpen(false);
    setSelectedTeacherId("");
  };

  // -------------------
  // Remove adviser
  // -------------------
  const handleRemoveAdviser = async () => {
    if (!token || !section) return;

    const ok = window.confirm("Remove adviser from this section?");
    if (!ok) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/sections/${section.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adviser: null }),
      });

      if (!res.ok) throw new Error("Failed to remove adviser");

      const updatedSection = await res.json();
      setSection(updatedSection);
      setSelectedTeacherId("");
    } catch (err) {
      console.error(err);
      alert("Failed to remove adviser");
    }
  };

  // -------------------
  // UI states
  // -------------------
  if (loading) return <div className="p-12 text-center">Loading students...</div>;
  if (!section) return <div className="p-12 text-center">Section Not Found</div>;

  return (
    <div className="flex-1 p-6 bg-slate-50 min-h-screen relative">
      {/* Navigation */}
      <Link
        to="/admin/students"
        className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group text-sm font-medium"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to All Sections
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {section.grade_level.replace("GRADE_", "Grade ")} — {section.name}
          </h1>

          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 flex-wrap">
            <Users size={14} />
            <span>
              Adviser: <span className="font-semibold text-slate-700">{adviserLabel}</span>
            </span>

            {hasAdviser && (
              <button
                type="button"
                onClick={handleRemoveAdviser}
                className="ml-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg"
              >
                <Trash2 size={14} />
                Remove Adviser
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: search + buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="Search student (name, email, ID)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-72 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />

          {/* Buttons */}
          {!hasAdviser ? (
            <button
              onClick={() => setIsAdviserModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md text-sm font-bold"
            >
              <Plus size={18} />
              Add Adviser
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 bg-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed"
            >
              <Plus size={18} />
              Adviser Assigned
            </button>
          )}

          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md text-sm font-bold"
          >
            <Plus size={18} />
            Add Students
          </button>
        </div>
      </div>


      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Enrolled Students ({students.length})
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-hidden min-h-screen">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  School ID
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Full Name
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Email
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.school_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{student.school_id}</span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-slate-900">{student.last_name}</span>,{" "}
                    {student.first_name}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>

                    {openMenuId === student.id && (
                      <div>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => handleRemoveFromSection(student.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={14} /> Remove Student
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Students Modal */}
      <AddStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        selectedStudentIds={selectedStudentIds}
        setSelectedStudentIds={setSelectedStudentIds}
        onSubmit={handleAddStudents}
        availableStudents={availableStudents}
      />

      {/* Add Adviser Modal (only openable if !hasAdviser) */}
      <AddAdviserModal
        isOpen={isAdviserModalOpen}
        onClose={() => setIsAdviserModalOpen(false)}
        selectedTeacherId={selectedTeacherId}
        setSelectedTeacherId={setSelectedTeacherId}
        availableTeachers={availableTeachers}
        onSubmit={handleAssignAdviser}
        currentAdviserName={section?.adviser_name ?? null}
      />
    </div>
  );
};
