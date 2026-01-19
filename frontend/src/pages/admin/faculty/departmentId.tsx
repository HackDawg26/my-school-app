import React, { useState } from "react";
import { ArrowLeft, MoreHorizontal, UserPlus,  Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AddTeacherModal from "./AddTeacherModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

 
  const [facultyMembers, setFacultyMembers] = useState([
    { id: 1, lastName: "Aquino", firstName: "Elena", email: "e.aquino@claroed.edu", advisory: "N/A" },
    { id: 2, lastName: "Reyes", firstName: "Juan", email: "j.reyes@claroed.edu", advisory: "Grade 7 - A" }
  ]);

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

  const handleDelete = (id: number) => {
    setFacultyMembers(prev =>
      prev.filter(member => member.id !== id)
    );
    setOpenMenuId(null);
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 min-h-screen relative">
      {/* Navigation & Header */}
      <Link to="/admin/faculty" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group text-sm font-medium">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to All Departments
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-hidden min-h-screen ">
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
                <td className="px-8 py-5 text-right relative">
                  <button onClick={()=>(setOpenMenuId(openMenuId === faculty.id ? null : faculty.id))}
                  className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all">
                    <MoreHorizontal size={20} className="text-slate-400" />
                  </button>

                  {openMenuId === faculty.id && (
                    <div className="">
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                        <div className="absolute right-0 mt-2 w-44  bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                            
                            
                            {/* Delete Button - Works for all because handleDelete checks activeTab */}
                            <button 
                                onClick={() => handleDelete(faculty.id)}
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

      {/* --- ADD TEACHER MODAL (Background Blur) --- */}
      <AddTeacherModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newTeacher={newTeacher}
        setNewTeacher={setNewTeacher}
        onSubmit={handleAddTeacher}
      />
    </div>
  );
};