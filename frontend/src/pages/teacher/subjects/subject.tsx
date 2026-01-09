import React from 'react';
import { BookOpen, Users, BarChart, AlertTriangle, Plus, type LucideIcon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubjects } from './SubjectProvider';

// --- Interfaces ---

export interface Subject {
  id: number | string;
  subject: string;
  section: string;
  grade: number | string;
  room: string;
  students: number;
  nextClass: string;
  average: number;
  pendingTasks: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

// --- Sub-component ---

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-4 rounded-xl shadow-md flex items-center space-x-3 ${colorClass}`}>
    <div className="p-1 rounded-full bg-opacity-20 ">
      <Icon size={28} className="h-7 w-7" />
    </div>
    <div className="flex flex-col">
      <p className="text-sm md:text-xl lg:text-3xl font-extrabold">{value}</p>
      <h2 className="text-xs md:text-sm lg:text-lg font-medium opacity-80">{title}</h2>
    </div>
  </div>
);

// --- Main Component ---

export default function SubjectListPage() {
  // We cast the hook return to ensure TypeScript knows the shape of 'subjects'
  const { subjects } = useSubjects() as { subjects: Subject[] };

  // --- Computed Statistics ---
  const totalClasses = subjects.length;
  const totalStudents = subjects.reduce((sum, subject) => sum + subject.students, 0);
  const totalPendingTasks = subjects.reduce((sum, subject) => sum + subject.pendingTasks, 0);
  const overallAvg = totalClasses > 0
    ? (subjects.reduce((sum, s) => sum + s.average, 0) / totalClasses).toFixed(1)
    : 'N/A';

  return (
    <section className="bg-slate-50/50 min-h-screen p-1 text-slate-900">
      {/* Header: More balanced and airy */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1 border-b border-slate-200 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Subject Roster
          </h1>
          <p className="text-slate-500 font-sm mt-1">
            Manage your teaching load and monitor student performance metrics.
          </p>
        </div>
        <Link
          to="/teacher/subject/create-subject"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>New Subject</span>
        </Link>
      </header>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">All Sections</h2>
          <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
            {totalClasses}
          </span>
        </div>

        {/* Grid: Improved spacing and sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {subjects.map(({ id, subject, section, grade, room, nextClass, students, average, pendingTasks }) => (
            <Link
              to={`/teacher/subject/${id}`}
              key={id}
              className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-3 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1.5"
            >
              {/* Top accent bar based on "Needs Grading" status */}
              {/* <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl ${pendingTasks > 5 ? 'bg-amber-400' : 'bg-indigo-500'}`} /> */}

              <div className="flex justify-between items-start mb-1">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 uppercase tracking-wide">
                    <span>Grade {grade}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Section {section}</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <BookOpen size={20} />
                </div>
              </div>

              {/* Schedule Info Block */}
              <div className="grid grid-cols-2 gap-4 p-2 bg-slate-50 rounded-xl mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room</span>
                  <span className="text-sm font-bold text-slate-700">{room}</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Class</span>
                  <span className="text-sm font-bold text-slate-700">{nextClass}</span>
                </div>
              </div>

              {/* Metrics List */}
              <div className="mt-auto space-y-2 px-2">
                <div className="flex items-center justify-between text-sm ">
                  <div className="flex items-center gap-2 font-semibold text-slate-600">
                    <Users size={18} className="text-blue-500" />
                    <span>Enrolled Students</span>
                  </div>
                  <span className="font-bold text-slate-900">{students}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-600">
                    <BarChart size={18} className={average < 85 ? 'text-rose-500' : 'text-emerald-500'} />
                    <span>Class Average</span>
                  </div>
                  <span className={`font-bold ${average < 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {average}%
                  </span>
                </div>

                <div className={`flex items-center justify-between text-sm rounded-lg ${pendingTasks > 0 ? 'bg-amber-50' : 'bg-transparent'}`}>
                  <div className="flex items-center gap-2 font-semibold text-amber-700">
                    <AlertCircle size={18} />
                    <span>Pending Grading</span>
                  </div>
                  <span className="font-bold text-amber-700">{pendingTasks}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}