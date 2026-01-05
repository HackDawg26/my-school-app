import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Users, FileText, TrendingUp, 
    BookOpen, type LucideIcon 
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
        </section>
    );
}