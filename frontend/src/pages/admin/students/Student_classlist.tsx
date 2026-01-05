import { ArrowLeft, MoreHorizontal } from "lucide-react/dist/lucide-react";
import { Link, useParams } from "react-router-dom";


export const studentSections = [
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

export const sectionAStudents = [
  {
    studentId: "STU-002",
    lastName: "Clara",
    firstName: "Maria",
    email: "m.clara@claroed.edu",
    password: "pw4737",
    status: "Active"
  },
  {
    studentId: "STU-001",
    lastName: "dela Cruz",
    firstName: "Juan",
    email: "j.delacruz@claroed.edu",
    password: "pw2777",
    status: "Active"
  },
  {
    studentId: "STU-003",
    lastName: "Rizal",
    firstName: "Jose",
    email: "j.rizal@claroed.edu",
    password: "pw5910",
    status: "Active"
  },
  {
    studentId: "STU-018",
    lastName: "Sulayman",
    firstName: "Rajah",
    email: "r.sulayman@claroed.edu",
    password: "pw6601",
    status: "Active"
  }
];


export const StudentClassList = () => {
  const { sectionId } = useParams<{ sectionId: string }>();

  // Use the same slug logic to find the section
  const currentSection = studentSections.find((s) => 
    `grade-${s.grade}-${s.name.toLowerCase().replace(/\s+/g, '-')}` === sectionId
  );

  if (!currentSection) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Section not found</h1>
        <Link to="/admin/students" className="text-blue-600 hover:underline">
          Return to All Sections
        </Link>
      </div>
    );
  }
  return (
    <div className="flex-1 p-1 bg-slate-50 min-h-screen">
      <Link to="/admin/students" className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-4 transition-colors group text-sm">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to All Sections
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{currentSection.grade} - {currentSection.name}</h1>
        <p className="text-slate-500 text-sm">Student Class List</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Students ({sectionAStudents.length})</h2>
          <p className="text-slate-500 text-sm">List of all students enrolled in this section.</p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sectionAStudents.map((student) => (
              <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 text-sm font-bold text-slate-700">{student.studentId}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{student.lastName}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{student.firstName}</td>
                <td className="px-4 py-4 text-sm text-slate-400">{student.email}</td>
                <td className="px-4 py-4 text-sm text-slate-400 font-mono">{student.password}</td>
                <td className="px-4 py-4 text-sm font-bold text-slate-700">{student.status}</td>
                <td className="px-4 py-4 text-right">
                  <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                    <MoreHorizontal size={18} className="text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};