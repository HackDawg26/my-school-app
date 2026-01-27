import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  BarChart,
  AlertTriangle,
  type LucideIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Type Definitions ---

interface SubjectOffering {
  id: number;
  name: string;
  section: string;
  grade: string | number;
  room_number: string;
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


// --- Sub-components ---

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
}) => (
  <div
    className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex items-center space-x-3 ${colorClass}`}
  >
    <div className="p-3 rounded-full bg-opacity-20 shrink-0">
      <Icon size={24} className="h-7 w-7" />
    </div>
    <div className="flex flex-col">
      <p className="text-3xl font-bold">{value}</p>
      <h2 className="text-sm font-medium opacity-80">{title}</h2>
    </div>
  </div>
);

// --- Main Component ---

export default function Dashboard() {
  const [subjects, setSubjects] = useState<SubjectOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!token) {
        setLoading(false);
        setErrorMsg("Not authenticated. Please log in again.");
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch("http://127.0.0.1:8000/api/subject-offerings/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Failed to load subject offerings:", err);
          setErrorMsg("Failed to load your subject offerings.");
          setSubjects([]);
          return;
        }

        const data = (await res.json()) as SubjectOffering[];
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading subjects.");
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [token]);
  console.log(subjects);

  // --- Computed Statistics ---
  const { totalClasses, totalStudents, totalPendingTasks, overallAvg } = useMemo(() => {
    const totalClasses = subjects.length;
    const totalStudents = subjects.reduce((sum, s) => sum + (s.students || 0), 0);
    const totalPendingTasks = subjects.reduce((sum, s) => sum + (s.pendingTasks || 0), 0);

    const overallAvg =
      totalClasses > 0
        ? (subjects.reduce((sum, s) => sum + (Number(s.average) || 0), 0) / totalClasses).toFixed(1)
        : "N/A";

    return { totalClasses, totalStudents, totalPendingTasks, overallAvg };
  }, [subjects]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // --- Loading / Error / Empty ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
        <p className="text-slate-700 font-semibold">{errorMsg}</p>
        <p className="text-slate-500 text-sm">
          If this keeps happening, check your token in localStorage and your backend permissions.
        </p>
      </div>
    );
  }

  return (
    <section className="p-1 bg-gray-50 space-y-6 text-gray-800">
      {/* --- Header Section --- */}
      <header className="mb-8 pb-4 border border-gray-100">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900">Teacher Dashboard</h2>
          <p className="text-lg mt-1 text-gray-600 dark:text-gray-400">
            {today}
          </p>
        </div>
      </header>

      {/* --- Quick Stats Section --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <StatCard title="Total Classes" value={totalClasses} icon={BookOpen} colorClass="bg-white text-gray-700" />
        <StatCard title="Total Students" value={totalStudents} icon={Users} colorClass="bg-white text-gray-700" />
        <StatCard title="Pending Tasks" value={totalPendingTasks} icon={AlertTriangle} colorClass="bg-white text-gray-700" />
        <StatCard title="Overall Avg." value={`${overallAvg}%`} icon={BarChart} colorClass="bg-white text-gray-700" />
      </div>

      {/* --- Course Overview Section --- */}
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Subjects</h2>
            <p className="text-slate-500 font-medium">
              You have {totalClasses} active classes this semester
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
            No subject offerings assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(({ id, name, section, grade, room_number, nextClass, students, average, pendingTasks }) => (
              <Link
                to={`/teacher/subject/${id}`}
                key={id}
                className="group relative block p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top Header Section */}
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                        {grade} -{section}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                    <BookOpen size={20} />
                  </div>
                </div>

                {/* Quick Info Bar */}
                <div className="flex items-center gap-6 mb-2 py-2 px-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    {room_number}
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                    <Clock size={14} className="text-slate-400" /> {nextClass}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-lg font-bold text-slate-800">{students}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Students</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 border-x border-slate-100">
                    <span className={`text-lg font-bold ${average < 85 ? "text-rose-500" : "text-emerald-500"}`}>
                      {average}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Average</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2">
                    <span className={`text-lg font-bold ${pendingTasks > 0 ? "text-amber-500" : "text-slate-400"}`}>
                      {pendingTasks}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
