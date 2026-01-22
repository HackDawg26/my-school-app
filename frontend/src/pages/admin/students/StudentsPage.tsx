import { 
  ArrowRight, 
  Plus, 
  Users, 
  Upload, 
  PlusCircle 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

type Section = {
  id: number;
  name: string;
  grade_level: string;
  adviser_name: string;
  student_count: number;
};

export const StudentAccountsPage = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
>>>>>>> Backup

  /* =========================
     FETCH SECTIONS
  ========================= */

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/sections/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sections");
        return res.json();
      })
      .then((data) => setSections(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     HELPERS
  ========================= */

  const formatGrade = (grade: string) =>
    grade.replace("_", " ").replace("GRADE", "Grade");



  /* =========================
     GROUP BY GRADE LEVEL
  ========================= */

  const sectionsByGrade = sections.reduce((acc, section) => {
    const gradeLabel = formatGrade(section.grade_level);
    if (!acc[gradeLabel]) acc[gradeLabel] = [];
    acc[gradeLabel].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

if (loading) {
    return (
      <main className="flex-1 p-6 text-center text-slate-500">
        Loading sections...
      </main>
    );
  }

const handleDeleteSection = async (sectionId: number) => {
  if (!window.confirm("Are you sure you want to delete this section?")) return;

  const token = localStorage.getItem("access");

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/sections/${sectionId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to delete section");

    // ✅ Remove from UI instantly
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  } catch (err) {
    console.error(err);
    alert("Failed to delete section");
  }
};
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
          <button
            onClick={() => {navigate('/admin/students/add-section')}}
           className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">
            <PlusCircle size={16} />
            Add Section
          </button>
          
        </div>
      </div>

      {/* Render Groups (Grade 7, Grade 8, etc.) */}
       {Object.entries(sectionsByGrade).map(([gradeLabel, gradeSections]) => (
        <div key={gradeLabel} className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {gradeLabel}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gradeSections.map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    {section.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Adviser: {section.adviser_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-slate-600 mb-6">
                  <Users size={18} className="text-slate-400" />
                  <span>{section.student_count} Students</span>
                </div>

                <div className="flex justify-between items-center">
                  <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete Section
                    </button>
                    <Link
                    to={`/admin/students/${section.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Manage Section
                      <ArrowRight size={16} />
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