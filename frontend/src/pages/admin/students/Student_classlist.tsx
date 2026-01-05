import React, { useState } from "react";
import { ArrowLeft, MoreHorizontal, Plus, Mail, ShieldCheck, Users, UserPlus, X, Fingerprint } from "lucide-react";
import { Link, useParams } from "react-router-dom";

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

export const initialStudents = [
  { studentId: "STU-002", lastName: "Clara", firstName: "Maria", email: "m.clara@claroed.edu", password: "pw4737", status: "Active" },
  { studentId: "STU-001", lastName: "dela Cruz", firstName: "Juan", email: "j.delacruz@claroed.edu", password: "pw2777", status: "Active" },
  { studentId: "STU-003", lastName: "Rizal", firstName: "Jose", email: "j.rizal@claroed.edu", password: "pw5910", status: "Active" },
  { studentId: "STU-018", lastName: "Sulayman", firstName: "Rajah", email: "r.sulayman@claroed.edu", password: "pw6601", status: "Active" }
];


// ... (studentSections and initialStudents arrays stay the same)

export const StudentClassList = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  
  // 1. Manage students in state so the list updates when we add one
  const [students, setStudents] = useState(initialStudents);
  
  // 2. Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
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
    setNewStudent({ studentId: "", firstName: "", lastName: "", email: "", password: "", status: "Active" });
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID & Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Credentials</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-700">{student.studentId}</span>
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {student.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-slate-900">{student.lastName}</span>, {student.firstName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">
                      {student.password}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD STUDENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 text-indigo-600">
                <UserPlus size={24} />
                <h3 className="text-xl font-bold text-slate-900">Enroll New Student</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Student ID</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-3 text-slate-300" size={16} />
                    <input 
                      required type="text" 
                      placeholder="STU-XXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                    onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">First Name</label>
                  <input 
                    required type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Last Name</label>
                  <input 
                    required type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-slate-300 flex items-center gap-2">
                   Official Email
                </label>
                <input 
                  required type="email" 
                  placeholder="name@claroed.edu"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                />
              </div>

              <div className="space-y-1 pb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Default Password</label>
                <input 
                  required type="password" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};