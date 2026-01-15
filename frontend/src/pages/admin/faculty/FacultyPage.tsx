
import { ArrowRight, FolderPlus, Plus, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const departments = [
    { id: 1, name: "Filipino", facultyCount: 2 },
    { id: 2, name: "English", facultyCount: 3 },
    { id: 3, name: "Mathematics", facultyCount: 3 },
    { id: 4, name: "Science", facultyCount: 3 },
    { id: 5, name: "Araling Panlipunan", facultyCount: 2 },
    { id: 6, name: "Edukasyon sa Pagpapakatao", facultyCount: 2 },
    { id: 7, name: "MAPEH", facultyCount: 2 },
];

export const FacultyPage = () => {
  const navigate = useNavigate();
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Department Added:", newDeptName);
    // Logic to save to your list goes here
    setIsDeptModalOpen(false);
    setNewDeptName("");
  };
  
  const getSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
  return (    
    <main className="flex-1 p-2">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Faculty Accounts</h1>
          <p className="text-slate-500">Select a department to view and manage faculty accounts.</p>
        </div>
        {/* Add Department - Triggers Modal */}
        <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsDeptModalOpen(true)}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm"
        >
          <FolderPlus size={18} className="text-indigo-600" />
          Add Department
        </button>

        {/* Add Faculty - Navigates to Page */}
        
        </div>
      </div>

      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeptModalOpen(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Create New Department</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Social Studies"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div 
            key={dept.id} 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">{dept.name}</h2>
              <p className="text-sm text-slate-400">Department</p>
            </div>
            
            <div className="flex items-center gap-2 text-slate-600 mb-6">
              <Users size={18} className="text-slate-400" />
              <span>{dept.facultyCount} Faculty</span>
            </div>

            <div className="flex justify-end">
              <Link 
                to={`/admin/faculty/${getSlug(dept.name)}`} 
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
              >
                View Faculty List
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}