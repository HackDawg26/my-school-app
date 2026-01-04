
import { ArrowRight, BookOpen } from 'lucide-react';

// Types for our data structure
interface SectionData {
  name: string;
  adviser: string;
  grade: string;
}

interface GradeGroup {
  level: string;
  sections: SectionData[];
}

const SectionCard = ({ section }: { section: SectionData }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4">
      <h3 className="text-xl font-bold text-slate-800">{section.name}</h3>
      <p className="text-sm text-slate-500">Adviser: {section.adviser}</p>
    </div>
    
    <div className="flex items-center gap-2 text-slate-400 mb-6">
      <BookOpen size={16} />
      <span className="text-sm">{section.grade}</span>
    </div>

    <div className="flex justify-end">
      <button className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors">
        Manage Subjects
        <ArrowRight size={16} />
      </button>
    </div>
  </div>
);

const SectionsPage = () => {
  const data: GradeGroup[] = [
    {
      level: "Grade 7",
      sections: [
        { name: "Section A", adviser: "Juan Reyes", grade: "Grade 7" },
        { name: "Section B", adviser: "Maria Santos", grade: "Grade 7" },
        { name: "Section C", adviser: "Ricardo Villanueva", grade: "Grade 7" },
      ]
    },
    {
      level: "Grade 8",
      sections: [
        { name: "Section A", adviser: "Pedro Garcia", grade: "Grade 8" },
        { name: "Section B", adviser: "Ana Cruz", grade: "Grade 8" },
        { name: "Section C", adviser: "Teresa Castro", grade: "Grade 8" },
      ]
    },
    {
      level: "Grade 9",
      sections: [
        { name: "Section A", adviser: "Luis Gonzales", grade: "Grade 9" },
        { name: "Section B", adviser: "Lina Torres", grade: "Grade 9" },
        { name: "Section C", adviser: "Ernesto Mercado", grade: "Grade 9" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-1">
      <div className="max-w-screen mx-auto">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Sections</h1>
          <p className="text-slate-500">List of all sections and their assigned advisers.</p>
        </header>

        {/* Grade Groups */}
        <div className="space-y-4">
          {data.map((group) => (
            <section key={group.level}>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{group.level}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.sections.map((section, idx) => (
                  <SectionCard key={idx} section={section} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionsPage;