import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom"; // 1. Import useParams

const departments = [
    { id: 1, name: "Filipino", facultyCount: 2 },
    { id: 2, name: "English", facultyCount: 3 },
    { id: 3, name: "Mathematics", facultyCount: 3 },
    { id: 4, name: "Science", facultyCount: 3 },
    { id: 5, name: "Araling Panlipunan", facultyCount: 2 },
    { id: 6, name: "Edukasyon sa Pagpapakatao", facultyCount: 2 },
    { id: 7, name: "MAPEH", facultyCount: 2 },
];

const facultyData = [
  // ... your faculty data
  {
    id: 1,
    lastName: "Aquino",
    firstName: "Elena",
    email: "e.aquino@claroed.edu",
    advisory: "N/A"
  },
  {
    id: 2,
    lastName: "Reyes",
    firstName: "Juan",
    email: "j.reyes@claroed.edu",
    advisory: "Grade 7 - A"
  }
];

export const FacultyList = () => {
 // 1. Get the department name from the URL
  const { department } = useParams();

  // 2. Find the department by reversing the slug logic
  // We compare "araling-panlipunan" (from URL) with "araling-panlipunan" (generated from data)
  const currentDepartment = departments.find(dept => 
    dept.name.toLowerCase().replace(/\s+/g, '-') === department
  );
  // 4. Fallback if department isn't found (optional but good practice)
  if (!currentDepartment) {
    return <div>Department not found</div>;
  }

  return (
    <div className="flex-1 p-1 bg-slate-50 min-h-screen">
      {/* Navigation & Header */}
      <Link
        to="/admin/faculty"
        className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-4 transition-colors group"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to All Departments
      </Link>

      <div className="mb-8">
        {/* 5. Use the found department object here */}
        <h1 className="text-3xl font-bold text-slate-900">{currentDepartment.name} Department</h1>
        <p className="text-slate-500">List of faculty members.</p>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100"> {/* Fixed typo: border-bottom -> border-b */}
              <th className="px-8 py-5 text-sm font-semibold text-slate-500">Last Name</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-500">First Name</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-500">Email</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-500">Advisory</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {facultyData.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5 text-slate-700 font-medium">{faculty.lastName}</td>
                <td className="px-8 py-5 text-slate-700">{faculty.firstName}</td>
                <td className="px-8 py-5 text-slate-500">{faculty.email}</td>
                <td className="px-8 py-5 text-slate-500">{faculty.advisory}</td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <MoreHorizontal size={20} className="text-slate-400" />
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