import React from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { BookOpen, Users, BarChart, AlertTriangle, type LucideIcon } from 'lucide-react';
=======
import { BookOpen, Users, BarChart, AlertTriangle, type LucideIcon, Clock, MapPin } from 'lucide-react';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
import { BookOpen, Users, BarChart, AlertTriangle, type LucideIcon, Clock, MapPin } from 'lucide-react';
>>>>>>> Backup
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
<<<<<<< HEAD
<<<<<<< HEAD
    <div className={`p-4 rounded-lg shadow-md flex items-center space-x-3 ${colorClass}`}>
=======
    <div className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex items-center space-x-3 ${colorClass}`}>
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
    <div className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex items-center space-x-3 ${colorClass}`}>
>>>>>>> Backup
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
<<<<<<< HEAD
<<<<<<< HEAD
        <section className="p-6 bg-gray-50 dark:bg-gray-100 min-h-screen text-gray-800 dark:text-gray-200">
            
            {/* --- Header Section --- */}
            <header className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
=======
        <section className="p-1 bg-gray-50  space-y-6 text-gray-800 ">
            
            {/* --- Header Section --- */}
            <header className="mb-8 pb-4 border border-gray-100 ">
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
        <section className="p-1 bg-gray-50  space-y-6 text-gray-800 ">
            
            {/* --- Header Section --- */}
            <header className="mb-8 pb-4 border border-gray-100 ">
>>>>>>> Backup
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900">Teacher Dashboard</h2>
                    <p className="text-lg mt-1 text-gray-600 dark:text-gray-400">
                        Welcome back, {teacherName}! • {today}
                    </p>
                </div>
            </header>

            {/* --- Quick Stats Section --- */}
<<<<<<< HEAD
<<<<<<< HEAD
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
=======
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
>>>>>>> Backup
                <StatCard 
                    title="Total Classes" 
                    value={totalClasses} 
                    icon={BookOpen} 
<<<<<<< HEAD
<<<<<<< HEAD
                    colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
=======
                    colorClass="bg-white text-gray-700 " 
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                    colorClass="bg-white text-gray-700 " 
>>>>>>> Backup
                />
                <StatCard 
                    title="Total Students" 
                    value={totalStudents} 
                    icon={Users} 
<<<<<<< HEAD
<<<<<<< HEAD
                    colorClass="bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" 
=======
                    colorClass="bg-white text-gray-700 " 
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                    colorClass="bg-white text-gray-700 " 
>>>>>>> Backup
                />
                <StatCard 
                    title="Pending Tasks" 
                    value={totalPendingTasks} 
                    icon={AlertTriangle} 
<<<<<<< HEAD
<<<<<<< HEAD
                    colorClass="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" 
=======
                    colorClass="bg-white text-gray-700 " 
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                    colorClass="bg-white text-gray-700 " 
>>>>>>> Backup
                />
                <StatCard 
                    title="Overall Avg." 
                    value={`${overallAvg}%`} 
                    icon={BarChart} 
<<<<<<< HEAD
<<<<<<< HEAD
                    colorClass="bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
=======
                    colorClass="bg-white text-gray-700" 
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                    colorClass="bg-white text-gray-700" 
>>>>>>> Backup
                />
            </div>

            {/* --- Course Overview Section --- */}
<<<<<<< HEAD
<<<<<<< HEAD
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Your Subjects ({totalClasses})
=======
            <div className="space-y-6 p-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                    <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Your Subjects
>>>>>>> Backup
                    </h2>
                    <p className="text-slate-500 font-medium">You have {totalClasses} active classes this semester</p>
                    </div>
                    
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
                    {subjects.map(({ id, subject, section, grade, room, nextClass, students, average, pendingTasks }) => (
                    <Link 
                        to={`/teacher/subject/${id}`} 
                        key={id} 
                        className="group relative block p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Top Header Section */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {subject}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                        Gr. {grade} • Sec. {section}
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
                                <MapPin size={14} className="text-slate-400" />Room {room}
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
                                <span className={`text-lg font-bold ${average < 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {average}%
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Average</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-2">
                                <span className={`text-lg font-bold ${pendingTasks > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                {pendingTasks}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks</span>
                            </div>
<<<<<<< HEAD
                        </Link>
=======
            <div className="space-y-6 p-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                    <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Your Subjects
                    </h2>
                    <p className="text-slate-500 font-medium">You have {totalClasses} active classes this semester</p>
                    </div>
                    
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
                    {subjects.map(({ id, subject, section, grade, room, nextClass, students, average, pendingTasks }) => (
                    <Link 
                        to={`/teacher/subject/${id}`} 
                        key={id} 
                        className="group relative block p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Top Header Section */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {subject}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                        Gr. {grade} • Sec. {section}
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
                                <MapPin size={14} className="text-slate-400" />Room {room}
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
                                <span className={`text-lg font-bold ${average < 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {average}%
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Average</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-2">
                                <span className={`text-lg font-bold ${pendingTasks > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                {pendingTasks}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks</span>
                            </div>
                        </div>
                    </Link>
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                        </div>
                    </Link>
>>>>>>> Backup
                    ))}
                </div>
            </div>
        </section>
    );
}