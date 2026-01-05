import React from 'react';
import { BookOpen, Users, BarChart, AlertTriangle, type LucideIcon } from 'lucide-react/dist/lucide-react';
import { Link } from 'react-router-dom';

// --- Type Definitions ---

interface Subject {
    id: number;
    subject: string;
    section: string;
    grade: number;
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

interface DashboardProps {
    teacherName?: string;
}

// --- Sub-components ---

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`p-4 rounded-lg shadow-md flex items-center space-x-3 ${colorClass}`}>
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

export default function Dashboard({ teacherName = "Mr. Camacho" }: DashboardProps) {
    
    // --- Data Definition ---
    const subjects: Subject[] = [
        { id: 1, subject: "Math", section: "1", grade: 7, room: "201", students: 28, nextClass: "Mon 9:00 AM", average: 84, pendingTasks: 3 },
        { id: 2, subject: "Algebra", section: "2", grade: 8, room: "204", students: 26, nextClass: "Tue 10:30 AM", average: 88, pendingTasks: 2 },
        { id: 3, subject: "Geometry", section: "1", grade: 9, room: "305", students: 30, nextClass: "Wed 11:15 AM", average: 81, pendingTasks: 4 },
    ];

    // --- Computed Statistics ---
    const totalClasses = subjects.length;
    const totalStudents = subjects.reduce((sum, subject) => sum + subject.students, 0);
    const totalPendingTasks = subjects.reduce((sum, subject) => sum + subject.pendingTasks, 0);
    
    const overallAvg = totalClasses > 0 
        ? (subjects.reduce((sum, s) => sum + s.average, 0) / totalClasses).toFixed(1)
        : 'N/A';

    const today = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <section className="p-6 bg-gray-50 dark:bg-gray-100 min-h-screen text-gray-800 dark:text-gray-200">
            
            {/* --- Header Section --- */}
            <header className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900">Teacher Dashboard</h2>
                    <p className="text-lg mt-1 text-gray-600 dark:text-gray-400">
                        Welcome back, {teacherName}! • {today}
                    </p>
                </div>
            </header>

            {/* --- Quick Stats Section --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Classes" 
                    value={totalClasses} 
                    icon={BookOpen} 
                    colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                />
                <StatCard 
                    title="Total Students" 
                    value={totalStudents} 
                    icon={Users} 
                    colorClass="bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" 
                />
                <StatCard 
                    title="Pending Tasks" 
                    value={totalPendingTasks} 
                    icon={AlertTriangle} 
                    colorClass="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" 
                />
                <StatCard 
                    title="Overall Avg." 
                    value={`${overallAvg}%`} 
                    icon={BarChart} 
                    colorClass="bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
                />
            </div>

            {/* --- Course Overview Section --- */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Your Subjects ({totalClasses})
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subjects.map(({ id, subject, section, grade, room, nextClass, students, average, pendingTasks }) => (
                        <Link 
                            to={`/subject/${id}`} 
                            key={id} 
                            className="block p-5 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition duration-300 dark:bg-gray-800 dark:border-gray-700 hover:scale-[1.02]"
                        >
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {subject} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Gr. {grade} - Sec. {section}</span>
                                </h3>
                            </div>
                            
                            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div className="flex items-center space-x-4">
                                    <span>Room: <span className="font-semibold">{room}</span></span>
                                    <span>Next: <span className="font-semibold">{nextClass}</span></span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col space-y-2">
                                <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Users size={18} className="mr-2 text-blue-500" />
                                    <span>{students} Students</span>
                                </div>
                                
                                <div className={`flex items-center text-sm font-medium ${average < 85 ? 'text-red-500' : 'text-green-500'}`}>
                                    <BarChart size={18} className="mr-2" />
                                    <span>{average}% Class Avg.</span>
                                </div>
                                
                                <div className="flex items-center text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                    <AlertTriangle size={18} className="mr-2" />
                                    <span>{pendingTasks} Tasks Pending</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}