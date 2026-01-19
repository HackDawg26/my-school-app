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


export const StudentClassList = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
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
            Grade {currentSection.grade} — {currentSection.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <Users size={14} />
            <span>Adviser: <span className="font-semibold text-slate-700">{currentSection.adviser}</span></span>
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
                  key={student.studentId}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* ID & Status */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700"> {student.studentId} </span>
                  </td>
                  
                  {/* Full Name */}
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-slate-900"> {student.lastName} </span>, {student.firstName}
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
                    <button onClick={()=>(setOpenMenuId(openMenuId === student.studentId ? null : student.studentId))} 
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>
                    
                    {openMenuId === student.studentId && (
                      <div className="">
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-0 mt-2 w-44  bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                            
                              {/* Delete Button - Works for all because handleDelete checks activeTab */}
                              <button 
                                  onClick={() => handleDelete(student.studentId)}
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
      />
    </div>
  );
};