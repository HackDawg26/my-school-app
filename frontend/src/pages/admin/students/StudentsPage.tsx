import { 
  ArrowRight, 
  Plus, 
  Users, 
  Download, 
  Upload, 
  PlusCircle 
} from "lucide-react/dist/lucide-react";
import { Link } from "react-router-dom";

const studentSections = [
  // Grade 7
  { id: 1, grade: 7, name: "Section A", adviser: "Juan Reyes", studentCount: 4 },
  { id: 2, grade: 7, name: "Section B", adviser: "Maria Santos", studentCount: 3 },
  { id: 3, grade: 7, name: "Section C", adviser: "Ricardo Villanueva", studentCount: 3 },
  
  // Grade 8
  { id: 4, grade: 8, name: "Section A", adviser: "Pedro Garcia", studentCount: 3 },
  { id: 5, grade: 8, name: "Section B", adviser: "Ana Cruz", studentCount: 2 },
  { id: 6, grade: 8, name: "Section C", adviser: "Teresa Castro", studentCount: 2 },

  // Grade 9
  { id: 7, grade: 9, name: "Section A", adviser: "Luis Gonzales", studentCount: 2 },
  { id: 8, grade: 9, name: "Section B", adviser: "Lina Torres", studentCount: 2 },
  { id: 9, grade: 9, name: "Section C", adviser: "Ernesto Mercado", studentCount: 2 },
];

export const StudentAccountsPage = () => {

  // 1. Helper function to turn "Section A" into "section-a" for URLs
  const getSlug = (grade: number, name: string) => 
    `grade-${grade}-${name.toLowerCase().replace(/\s+/g, '-')}`;

  // 2. Logic to Group sections by Grade Level
  const sectionsByGrade = studentSections.reduce((acc, section) => {
    const gradeKey = `Grade ${section.grade}`;
    if (!acc[gradeKey]) {
      acc[gradeKey] = [];
    }
    acc[gradeKey].push(section);
    return acc;
  }, {} as Record<string, typeof studentSections>);

  return (
    <main className="flex-1 p-1 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Accounts</h1>
          <p className="text-slate-500">Select a section to view and manage student accounts.</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">
            <Upload size={16} />
            Import Classlist
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">
            <PlusCircle size={16} />
            Add Section
          </button>
          <button className="flex items-center gap-2 bg-[#3b5998] hover:bg-[#2d4373] text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Render Groups (Grade 7, Grade 8, etc.) */}
      {Object.entries(sectionsByGrade).map(([gradeLabel, sections]) => (
        <div key={gradeLabel} className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{gradeLabel}</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <div 
                key={section.id} 
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{section.name}</h3>
                  <p className="text-sm text-slate-500">Adviser: {section.adviser}</p>
                </div>
                
                <div className="flex items-center gap-2 text-slate-600 mb-6">
                  <Users size={18} className="text-slate-400" />
                  <span>{section.studentCount} Students</span>
                </div>

                <div className="flex justify-end">
                  <Link 
                    to={`/admin/students/${getSlug(section.grade, section.name)}`} 
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
                  >
                    Manage Section
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
};