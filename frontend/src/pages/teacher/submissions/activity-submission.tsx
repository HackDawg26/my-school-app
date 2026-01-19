import { Calendar, CheckCircle, ChevronLeft, Download, Printer } from "lucide-react";
import React, { useMemo } from "react";
import { mockSubmissions, getStatusClass } from "./sub-mock-data.ts";

// --- Interfaces for TSX Compatibility ---

interface Activity {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    totalCount: number;
}

interface Submission {
    studentId: string;
    studentName: string;
    submittedAt: string;
    status: string;
}



// --- Component ---

const ActivitySubmissions = ({ activity, onBack }: any) => {
    // Type the useMemo as an array of Submissions
    const submissions = useMemo<Submission[]>(() => 
        (mockSubmissions as Record<string, Submission[]>)[activity?.id] || [], 
        [activity]
    );
    
    const submissionsCount = submissions.length;
    const totalCount = activity.totalCount;

    // Tailwind utility classes
    const pillClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const tableHeaderClass = "px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50";

    return (
        <div className="bg-slate-50/50 min-h-screen relative flex flex-col">
            <div className="flex-1 p-1 pb-24"> {/* Added padding-bottom so content isn't hidden by the footer */}
                
                {/* Navigation & Header */}
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
                    <div className="space-y-2">
                        <button 
                            className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold tracking-tight uppercase" 
                            onClick={onBack}
                        >
                            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> 
                            Back to Activities
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{activity.title}</h1>
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{activity.subject}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> Due {activity.dueDate}</span>
                        </div>
                    </div>
                    
                    <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
                        <CheckCircle size={18} />
                        Grade All
                    </button>
                </header>

                {/* Submissions Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">ID Number</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Date Submitted</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissions.map((s) => (
                                    <tr key={s.studentId} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                    {s.studentName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-bold text-slate-700">{s.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">#{s.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{s.submittedAt}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                                s.status.toLowerCase() === 'graded' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${s.status.toLowerCase() === 'graded' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className='px-4 py-2 text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm'>
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Stats Bar */}
            <footer className="sticky bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 px-8 py-4 z-20">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Rate</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-900">{Math.round((submissionsCount/totalCount)*100)}%</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${(submissionsCount/totalCount)*100}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Grade</span>
                            <span className="text-xl font-black text-amber-500">
                                {submissions.filter(s => s.status.toLowerCase() !== 'graded').length}
                            </span>
                        </div>

                        <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Average</span>
                            <span className="text-xl font-black text-emerald-500">84.2%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Download size={20} />
                        </button>
                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Printer size={20} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default ActivitySubmissions;