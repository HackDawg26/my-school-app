import React, { useState } from "react";
import { ArrowLeft, MoreHorizontal, UserPlus, X, Mail, Shield, CheckCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

const departments = [
  { id: 1, name: "Filipino", facultyCount: 2 },
  { id: 2, name: "English", facultyCount: 3 },
  { id: 3, name: "Mathematics", facultyCount: 3 },
  { id: 4, name: "Science", facultyCount: 3 },
  { id: 5, name: "Araling Panlipunan", facultyCount: 2 },
  { id: 6, name: "Edukasyon sa Pagpapakatao", facultyCount: 2 },
  { id: 7, name: "MAPEH", facultyCount: 2 },
];

export const FacultyList = () => {
  const { department } = useParams();
  const navigate = useNavigate();

  // 1. State for Faculty Data (initialized with your mock data)
  const [facultyMembers, setFacultyMembers] = useState([
    { id: 1, lastName: "Aquino", firstName: "Elena", email: "e.aquino@claroed.edu", advisory: "N/A" },
    { id: 2, lastName: "Reyes", firstName: "Juan", email: "j.reyes@claroed.edu", advisory: "Grade 7 - A" }
  ]);

  // 2. Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    firstName: "",
    lastName: "",
    email: "",
    advisory: "N/A"
  });

  const currentDepartment = departments.find(dept => 
    dept.name.toLowerCase().replace(/\s+/g, '-') === department
  );

  if (!currentDepartment) {
    return <div className="p-10 text-center font-bold">Department not found</div>;
  }

  // 3. Handle Adding Teacher
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const teacherToAdd = {
      ...newTeacher,
      id: Date.now(), // Unique ID for mock purposes
    };

    setFacultyMembers([...facultyMembers, teacherToAdd]);
    setIsModalOpen(false); // Close modal
    setNewTeacher({ firstName: "", lastName: "", email: "", advisory: "N/A" }); // Reset form
    console.log("Teacher Added:", teacherToAdd);
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 min-h-screen relative">
      {/* Navigation & Header */}
      <Link to="/admin/faculty" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group text-sm font-medium">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to All Departments
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{currentDepartment.name} Department</h1>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
            {facultyMembers.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-700">{faculty.lastName}</span>, {faculty.firstName}
                </td>
                <td className="px-8 py-5 text-slate-500 text-sm">{faculty.email}</td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${faculty.advisory === 'N/A' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-700'}`}>
                    {faculty.advisory}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all">
                    <MoreHorizontal size={20} className="text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD TEACHER MODAL (Background Blur) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Add Faculty Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                  <input 
                    required type="text" 
                    value={newTeacher.firstName}
                    onChange={(e) => setNewTeacher({...newTeacher, firstName: e.target.value})}
                    placeholder="e.g. Maria"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                  <input 
                    required type="text" 
                    value={newTeacher.lastName}
                    onChange={(e) => setNewTeacher({...newTeacher, lastName: e.target.value})}
                    placeholder="e.g. Santos"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input 
                  required type="email" 
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  placeholder="m.santos@claroed.edu"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={12} /> Advisory Class (Optional)
                </label>
                <input 
                  type="text" 
                  value={newTeacher.advisory}
                  onChange={(e) => setNewTeacher({...newTeacher, advisory: e.target.value})}
                  placeholder="e.g. Grade 7 - B"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};