
import { ArrowRight, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";

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
  
  const getSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
  return (
    
    <main className="flex-1 p-1">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Faculty Accounts</h1>
          <p className="text-slate-500">Select a department to view and manage faculty accounts.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3b5998] hover:bg-[#2d4373] text-white px-4 py-2 rounded-md transition-colors">
          <Plus size={18} />
          <span className="font-medium">Add Faculty</span>
        </button>
      </div>

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
