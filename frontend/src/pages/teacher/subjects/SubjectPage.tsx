import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Users, FileText, TrendingUp, 
<<<<<<< HEAD
    BookOpen, type LucideIcon 
=======
    BookOpen, type LucideIcon, 
    Settings,
    MapPin,
    Calendar,
    Download,
    Plus
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
} from 'lucide-react';
import { useSubjects, type Subject } from './SubjectProvider';

// --- Interfaces ---

interface Assignment {
    id: string;
    name: string;
    due: string;
    status: 'Grading' | 'Assigned' | 'Overdue';
    count: number;
}

interface RecentGrade {
    student: string;
    grade: number;
    assignment: string;
}

interface DetailedSubject extends Subject {
    schedule?: string;
    assignments?: Assignment[];
    recentGrades?: RecentGrade[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: 'stat-green' | 'stat-red' | 'stat-purple' | 'stat-orange' | 'stat-blue';
}

// --- Dummy Data ---
// In a real app, this would likely come from an API call using the ID
const ALL_SUBJECT_DATA: Record<number, Partial<DetailedSubject>> = {
    1: {
        schedule: "Mon, Wed, Fri | 9:00 AM - 10:00 AM",
        assignments: [
            { id: 'A1', name: 'Ratios and Proportions Quiz', due: 'Nov 10', status: 'Grading', count: 12 },
            { id: 'A2', name: 'Geometry Basics Homework', due: 'Nov 8', status: 'Assigned', count: 28 },
        ],
        recentGrades: [
            { student: 'Alex J.', grade: 92, assignment: 'Fractions Test' },
            { student: 'Maria P.', grade: 78, assignment: 'Ratios HW' },
        ]
    },
    2: {
        schedule: "Tue, Thu | 10:30 AM - 12:00 PM",
        assignments: [
            { id: 'A3', name: 'Quadratic Equations Midterm', due: 'Nov 15', status: 'Assigned', count: 26 },
        ],
        recentGrades: [
            { student: 'Ben C.', grade: 88, assignment: 'Polynomials Quiz' },
            { student: 'Sarah L.', grade: 95, assignment: 'Linear Eq. Test' },
        ]
    },
    3: {
        schedule: "Mon, Wed | 11:15 AM - 12:15 PM",
        assignments: [
            { id: 'A4', name: 'Circle Theorems Lab', due: 'Nov 12', status: 'Grading', count: 30 },
            { id: 'A5', name: 'Trigonometry Homework', due: 'Nov 18', status: 'Assigned', count: 30 },
            { id: 'A6', name: 'Area & Volume Quiz', due: 'Nov 6', status: 'Overdue', count: 0 },
        ],
        recentGrades: []
    },
};

// --- Stat Card Component ---
const SubjectStatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
    const colorMap = {
        'stat-green': 'bg-emerald-100 text-emerald-600',
        'stat-red': 'bg-rose-100 text-rose-600',
        'stat-purple': 'bg-purple-100 text-purple-600',
        'stat-orange': 'bg-amber-100 text-amber-600',
        'stat-blue': 'bg-blue-100 text-blue-600',
    };

    return (
        <div className="flex items-center p-4 bg-white rounded-xl shadow-md border border-gray-100">
            <div className={`p-3 rounded-full mr-4 ${colorMap[colorClass]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <h3 className="text-sm font-medium text-gray-500 mt-1">{title}</h3>
            </div>
        </div>
    );
};

export default function SubjectPage() {
    const { id } = useParams<{ id: string }>();
    const { subjects } = useSubjects();
    const [subject, setSubject] = useState<DetailedSubject | null>(null);

    const subjectId = parseInt(id || '0', 10);

    useEffect(() => {
        const foundSubject = subjects.find(s => s.id === subjectId);
        const detailedData = ALL_SUBJECT_DATA[subjectId] || {};

        if (foundSubject) {
            setSubject({ ...foundSubject, ...detailedData });
        }
    }, [subjectId, subjects]);

    if (!subject) {
        return (
            <div className="p-10 text-center bg-gray-50 min-h-screen">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Loading Subject...</h1>
                <p className="text-lg text-gray-600 mb-6">Could not locate the course with ID: {id}.</p>
                <Link to="/teacher/subject" className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md">
                    <ArrowLeft size={16} className="mr-2" /> Back to Subject List
                </Link>
            </div>
        );
    }

    const gradingCount = (subject.assignments || []).filter(a => a.status === 'Grading').length;

    return (
<<<<<<< HEAD
        <section className="bg-gray-50 min-h-screen p-1">
            {/* HEADER */}
            <header className="pb-1 mb-6 border-b border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                    <Link to="/teacher/subject" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={26} className="text-gray-700" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {subject.subject}
                            <span className="text-xl text-gray-500 ml-2 font-normal">
                                • Gr. {subject.grade} Sec. {subject.section}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Room: {subject.room} | Schedule: {subject.schedule || 'Not Set'}
                        </p>
                    </div>
                </div>

                <nav className="flex items-center space-x-8 mt-2">
                    {['Overview', 'Files', 'Activity', 'Grades'].map((tab) => (
                        <Link 
                            key={tab}
                            to="#" 
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 pb-2 transition-all"
                        >
                            {tab}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SubjectStatCard 
                    title="Class Average" 
                    value={`${subject.average}%`} 
                    icon={TrendingUp} 
                    colorClass={subject.average < 85 ? 'stat-red' : 'stat-green'}
                />
                <SubjectStatCard title="Total Students" value={subject.students} icon={Users} colorClass="stat-purple" />
                <SubjectStatCard title="Pending Tasks" value={subject.pendingTasks} icon={FileText} colorClass="stat-orange" />
                <SubjectStatCard title="Needs Grading" value={gradingCount} icon={BookOpen} colorClass="stat-blue" />
            </div>

            {/* ASSIGNMENTS + RECENT GRADES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assignments List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Upcoming Assignments ({(subject.assignments || []).length})
                    </h2>
                    <ul className="divide-y divide-gray-100">
                        {(subject.assignments || []).map(a => (
                            <li key={a.id} className="py-4 flex justify-between items-center group">
                                <span className="font-medium text-gray-700">{a.name}</span>
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-400 text-sm">Due: {a.due}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                        ${a.status === 'Grading' ? 'bg-amber-100 text-amber-700' : 
                                          a.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 
                                          'bg-gray-100 text-gray-600'}`}>
                                        {a.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Grades Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Recent Grades ({(subject.recentGrades || []).length})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase">Student</th>
                                    <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase">Assignment</th>
                                    <th className="text-right py-3 text-xs font-semibold text-gray-400 uppercase">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subject.recentGrades && subject.recentGrades.length > 0 ? (
                                    subject.recentGrades.map((g, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 text-sm font-medium text-gray-700">{g.student}</td>
                                            <td className="py-4 text-sm text-gray-500">{g.assignment}</td>
                                            <td className="py-4 text-sm text-right font-bold">
                                                <span className={g.grade < 80 ? "text-rose-600" : "text-emerald-600"}>
                                                    {g.grade}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                                            No recent grades posted.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
=======
        <section className="bg-slate-50/30 min-h-screen p-1 font-sans">
            {/* HEADER: Sophisticated Typography & Clean Actions */}
            <header className=" mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-4">
                        <Link to="/teacher/subject" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Subjects
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {subject.subject}
                                </h1>
                                <span className="h-6 w-px bg-slate-200" />
                                <span className="text-lg font-medium text-slate-500">
                                    Gr. {subject.grade} — {subject.section}
                                </span>
                            </div>
                            <p className="text-slate-500 flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> Room {subject.room}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {subject.schedule || 'MWF • 09:00 AM'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                            <Download size={18} /> Export List
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-indigo-100 shadow-lg hover:bg-indigo-700 transition-all">
                            <Plus size={18} /> New Activity
                        </button>
                    </div>
                </div>

                {/* NAVIGATION: Minimalist Pill-Style */}
                <nav className="flex items-center p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-200/60">
                    {['Overview', 'Files', 'Activity', 'Grades'].map((tab) => {
                        const isActive = tab === 'Overview';
                        return (
                            <Link 
                                key={tab}
                                to="#" 
                                className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                    isActive 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {tab}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <main className=" mx-auto space-y-8">
                {/* METRICS: Modern Borderless Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SubjectStatCard 
                        title="Avg. Performance" 
                        value={`${subject.average}%`} 
                        icon={TrendingUp} 
                        colorClass={subject.average < 85 ? 'stat-red' : 'stat-green'}
                    />
                    <SubjectStatCard title="Total Students" value={subject.students} icon={Users} colorClass="stat-purple" />
                    <SubjectStatCard title="Open Tasks" value={subject.pendingTasks} icon={FileText} colorClass="stat-orange" />
                    <SubjectStatCard title="Unfinished Grading" value={gradingCount} icon={BookOpen} colorClass="stat-blue" />
                </div>

                {/* CONTENT GRID: Balanced Proportions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT: Assignments (Clean List Design) */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming Roadmap</h2>
                            <Link to="#" className="text-xs font-bold text-indigo-600">View Timeline</Link>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
                            {subject.assignments?.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-base">{a.name}</h4>
                                            <p className="text-xs font-medium text-slate-400">Section: Written Works • {a.due}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase">Submissions</p>
                                            <p className="text-xs font-bold text-slate-600">24 / 30</p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                            a.status === 'Grading' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                                            a.status === 'Overdue' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
                                            'bg-slate-50 border-slate-200 text-slate-500'
                                        }`}>
                                            {a.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Recent Activity (Social/Human Centric) */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">Recent Evaluations</h2>
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                            <div className="space-y-6">
                                {subject.recentGrades?.map((g, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">
                                                {g.student.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{g.student}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{g.assignment}</p>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-black px-2 py-1 rounded-md ${g.grade < 80 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {g.grade}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                                Detailed Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </main>
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
        </section>
    );
}