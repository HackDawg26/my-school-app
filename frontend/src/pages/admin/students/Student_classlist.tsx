<<<<<<< HEAD
import React, { useState } from "react";
import { ArrowLeft, MoreHorizontal, Plus, Mail, ShieldCheck, Users, UserPlus, X, Fingerprint, RefreshCw, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";

// Data exports (unchanged logic)
export const studentSections = [
  { id: 1, grade: 7, name: "Section A", adviser: "Juan Reyes", studentCount: 4 },
  { id: 2, grade: 7, name: "Section B", adviser: "Maria Santos", studentCount: 3 },
  { id: 3, grade: 7, name: "Section C", adviser: "Ricardo Villanueva", studentCount: 3 },
  { id: 4, grade: 8, name: "Section A", adviser: "Pedro Garcia", studentCount: 3 },
  { id: 5, grade: 8, name: "Section B", adviser: "Ana Cruz", studentCount: 2 },
  { id: 6, grade: 8, name: "Section C", adviser: "Teresa Castro", studentCount: 2 },
  { id: 7, grade: 9, name: "Section A", adviser: "Luis Gonzales", studentCount: 2 },
  { id: 8, grade: 9, name: "Section B", adviser: "Lina Torres", studentCount: 2 },
  { id: 9, grade: 9, name: "Section C", adviser: "Ernesto Mercado", studentCount: 2 },
];
=======
import React, { useState, useEffect } from "react";
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
  adviser_name: string;
}
>>>>>>> Backup


export const StudentClassList = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
<<<<<<< HEAD
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  
  const handleDelete = (id: string) => {
    setStudents(prev =>
      prev.filter(member => member.studentId !== id)
    );
    setOpenMenuId(null);
  };

  // 1. Manage students in state so the list updates when we add one
  const [students, setStudents] = useState(
    [
      { studentId: "STU-002", lastName: "Clara", firstName: "Maria", email: "m.clara@claroed.edu",  status: "Active" },
      { studentId: "STU-001", lastName: "dela Cruz", firstName: "Juan", email: "j.delacruz@claroed.edu",  status: "Active" },
      { studentId: "STU-003", lastName: "Rizal", firstName: "Jose", email: "j.rizal@claroed.edu",  status: "Active" },
      { studentId: "STU-018", lastName: "Sulayman", firstName: "Rajah", email: "r.sulayman@claroed.edu", status: "Active" }
    ]
  );
  
  // 2. Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    status: "Active"
  });

  const currentSection = studentSections.find((s) => 
    `grade-${s.grade}-${s.name.toLowerCase().replace(/\s+/g, '-')}` === sectionId
  );

  // 3. Handle Form Submission
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudents([newStudent, ...students]); // Add to top of list
    setIsModalOpen(false); // Close modal
    // Reset form
    setNewStudent({ studentId: "", firstName: "", lastName: "", email: "", status: "Active" });
  };

  if (!currentSection) return <div className="p-12 text-center">Section Not Found</div>;
=======
  
  // -------------------
  // State
  // -------------------
  const [students, setStudents] = useState<Student[]>([]);
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdviserModalOpen, setIsAdviserModalOpen] = useState(false);
  const token = localStorage.getItem("access");

  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | "">("");

useEffect(() => {
  if (!token || !section) return;

  fetch(
    `http://127.0.0.1:8000/api/students/?section=null&grade_level=${section.grade_level}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then(res => res.json())
    .then(data => setAvailableStudents(data));
}, [section, token]);

useEffect(() => {
  if (!token) return;

  fetch("http://127.0.0.1:8000/api/teachers/", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => setAvailableTeachers(data));
}, [token]);

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
  if (!token || !section || !selectedStudentId) return;

  const res = await fetch(
    `http://127.0.0.1:8000/api/students/${selectedStudentId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ section: section.id }),
    }
  );

  if (!res.ok) {
    alert("Failed to assign student");
    return;
  }

  const updated = await res.json();

  setStudents(prev => [...prev, updated]);
  setIsStudentModalOpen(false);
  setSelectedStudentId("");
};

  // -------------------
  // Remove Student
  // -------------------
    const handleRemoveFromSection = async (id: number) => {
  if (!token) return;

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/students/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section: null }), // ✅ THIS IS REQUIRED
      }
    );

    if (!res.ok) throw new Error("Remove failed");

    // ✅ Update local state: remove only from section view
    setStudents(prev => prev.filter(student => student.id !== id));
  } catch (err) {
    console.error(err);
    alert("Failed to remove student from section");
  } finally {
    setOpenMenuId(null);
  }
};

const handleAssignAdviser = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token || !section || !selectedTeacherId) return;

  const res = await fetch(
    `http://127.0.0.1:8000/api/sections/${section.id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ adviser: selectedTeacherId }),
    }
  );

  if (!res.ok) {
    alert("Failed to assign adviser");
    return;
  }

  const updatedSection = await res.json();
  setSection(updatedSection);
  setIsAdviserModalOpen(false);
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
>>>>>>> Backup

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
<<<<<<< HEAD
            Grade {currentSection.grade} — {currentSection.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <Users size={14} />
            <span>Adviser: <span className="font-semibold text-slate-700">{currentSection.adviser}</span></span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
=======
            {section.grade_level.replace("GRADE_", "Grade ")} — {section.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <Users size={14} />
            <span>Adviser: <span className="font-semibold text-slate-700">{section.adviser_name}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsAdviserModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm font-bold"
        >
          <Plus size={18} />
          Add Adviser
        </button>

        <button 
          onClick={() => setIsStudentModalOpen(true)}
>>>>>>> Backup
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm font-bold"
        >
          <Plus size={18} />
          Add New Student
        </button>
<<<<<<< HEAD
=======
        </div>
>>>>>>> Backup
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
<<<<<<< HEAD
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Advisory Class</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
=======
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
>>>>>>> Backup
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr
<<<<<<< HEAD
                  key={student.studentId}
=======
                  key={student.school_id}
>>>>>>> Backup
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* ID & Status */}
                  <td className="px-6 py-4">
<<<<<<< HEAD
                    <span className="text-sm font-bold text-slate-700"> {student.studentId} </span>
=======
                    <span className="text-sm font-bold text-slate-700"> {student.school_id} </span>
>>>>>>> Backup
                  </td>
                  
                  {/* Full Name */}
                  <td className="px-6 py-4 text-sm">
<<<<<<< HEAD
                    <span className="font-bold text-slate-900"> {student.lastName} </span>, {student.firstName}
=======
                    <span className="font-bold text-slate-900"> {student.last_name} </span>, {student.first_name}
>>>>>>> Backup
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4 ">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  </td>

<<<<<<< HEAD
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
                    <button onClick={()=>(setOpenMenuId(openMenuId === student.studentId ? null : student.studentId))} 
=======
                  {/* Action */}
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={()=>(setOpenMenuId(openMenuId === student.id ? null : student.id))} 
>>>>>>> Backup
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>
                    
<<<<<<< HEAD
                    {openMenuId === student.studentId && (
=======
                    {openMenuId === student.id && (
>>>>>>> Backup
                      <div className="">
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-0 mt-2 w-44  bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                            
                              {/* Delete Button - Works for all because handleDelete checks activeTab */}
                              <button 
<<<<<<< HEAD
                                  onClick={() => handleDelete(student.studentId)}
=======
                                  onClick={() => handleRemoveFromSection(student.id)}
>>>>>>> Backup
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
<<<<<<< HEAD
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        onSubmit={handleAddStudent}
      />
=======
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        onSubmit={handleAddStudent}
        availableStudents={availableStudents}
      />
      <AddAdviserModal
      isOpen={isAdviserModalOpen}
      onClose={() => setIsAdviserModalOpen(false)}
      selectedTeacherId={selectedTeacherId}
      setSelectedTeacherId={setSelectedTeacherId}
      availableTeachers={availableTeachers}
      onSubmit={handleAssignAdviser}
/>
>>>>>>> Backup
    </div>
  );
};