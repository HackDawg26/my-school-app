import React, { useState, useEffect } from "react";
import { ArrowLeft, MoreHorizontal, Plus, Mail, Users, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Section {
  id: number;
  name: string;
  grade_level: string;
  adviser_name: string;
}


export const StudentClassList = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  
  // -------------------
  // State
  // -------------------
  const [students, setStudents] = useState<Student[]>([]);
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    status: "Active"
  });

  const token = localStorage.getItem("access");

  // -------------------
  // Fetch Section Info
  // -------------------
useEffect(() => {
    if (!sectionId || !token) return;

    const fetchSection = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/sections/${sectionId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
  // Fetch Students
  // -------------------
 useEffect(() => {
    if (!sectionId || !token) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/sections/${sectionId}/students/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load students");

        const data: Student[] = await res.json();
        setStudents(data);
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
  // Add Student
  // -------------------
   const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !section) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: newStudent.studentId,
          first_name: newStudent.firstName,
          last_name: newStudent.lastName,
          email: newStudent.email,
          status: newStudent.status,
          grade_level: section.grade_level,
          section: section.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to add student");

      const saved = await res.json();
      setStudents((prev) => [saved, ...prev]);
      setIsModalOpen(false);
      setNewStudent({
        studentId: "",
        firstName: "",
        lastName: "",
        email: "",
        status: "Active",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add student");
    }
  };

  // -------------------
  // Remove Student
  // -------------------
    const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/students/${id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    } finally {
      setOpenMenuId(null);
    }
  };

  /* ======================
     STATES
  ====================== */
  if (loading) {
    return <div className="p-12 text-center">Loading students...</div>;
  }

  if (!section) {
    return <div className="p-12 text-center">Section Not Found</div>;
  }

  return (
    <div className="flex-1 p-6 bg-slate-50 min-h-screen relative">
      {/* Navigation */}
      <Link to="/admin/students" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group text-sm font-medium">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to All Sections
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {section.grade_level.replace("GRADE_", "Grade ")} — {section.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <Users size={14} />
            <span>Adviser: <span className="font-semibold text-slate-700">{section.adviser_name}</span></span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm font-bold"
        >
          <Plus size={18} />
          Add New Student
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Enrolled Students ({students.length})</h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-hidden min-h-screen ">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">School ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Advisory Class</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr
                  key={student.student_id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* ID & Status */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700"> {student.student_id} </span>
                  </td>
                  
                  {/* Full Name */}
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-slate-900"> {student.last_name} </span>, {student.first_name}
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4 ">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                        className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          student.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      > {student.status}
                      </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={()=>(setOpenMenuId(openMenuId === student.id ? null : student.id))} 
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>
                    
                    {openMenuId === student.id && (
                      <div className="">
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-0 mt-2 w-44  bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                            
                              {/* Delete Button - Works for all because handleDelete checks activeTab */}
                              <button 
                                  onClick={() => handleDelete(student.id)}
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
      </div>

      

      {/* --- ADD STUDENT MODAL --- */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        onSubmit={handleAddStudent}
        students={students}
      />
    </div>
  );
};