<<<<<<< HEAD
<<<<<<< HEAD
import { ChevronLeft } from "lucide-react";
=======
import { Calendar, CheckCircle, ChevronLeft, Download, Printer } from "lucide-react";
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
import React, { useMemo } from "react";
import { mockSubmissions, getStatusClass } from "./sub-mock-data.ts";
=======
import { ChevronRight, ClipboardCheck, Filter, Search } from "lucide-react";
import React, { useState, useMemo } from "react";
>>>>>>> Backup

import { mockActivities, mockSubmissions } from "./sub-mock-data.ts";


// --- Interfaces Based on your Data ---

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
    status: 'Graded' | 'Pending' | string;
}

// Typing for the mockSubmissions object (Object with string keys and Array values)
type SubmissionsData = Record<string, Submission[]>;

interface ExtendedActivity extends Activity {
    pendingReviewCount: number;
    submittedCount: number;
}

interface SubjectGroup {
    name: string;
    activities: ExtendedActivity[];
    totalSubmissions: number;
    totalPendingReview: number;
    totalActivities: number;
}

// --- The Grouping Logic ---




const ActivityList = ({ onSelectSubject }: any) => {
    // Grouping logic is preserved in useMemo
    const groupedActivities = useMemo<SubjectGroup[]>(() => {
        // Record<string, ExtendedActivity[]> allows dynamic keys like 'Math • Section 1'
        const groups: Record<string, ExtendedActivity[]> = {};
        
        (mockActivities as Activity[]).forEach(act => {
            if (!groups[act.subject]) {
                groups[act.subject] = [];
            }

            // Look up submissions using the ID from mockSubmissions
            const submissions = (mockSubmissions as SubmissionsData)[act.id] || [];

            groups[act.subject].push({
                ...act,
                pendingReviewCount: submissions.filter(s => s.status === 'Pending').length,
                submittedCount: submissions.length,
            });
        });
        
        return Object.keys(groups).map(subjectName => ({
            name: subjectName,
            activities: groups[subjectName],
            totalSubmissions: groups[subjectName].reduce((sum, a) => sum + a.submittedCount, 0),
            totalPendingReview: groups[subjectName].reduce((sum, a) => sum + a.pendingReviewCount, 0),
            totalActivities: groups[subjectName].length,
        }));
    }, []);

    const inputClass = "pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none w-full text-sm";
    
    // State for local subject search (new feature added for functionality)
    const [subjectQuery, setSubjectQuery] = useState('');
    
    const filteredSubjects = groupedActivities.filter(sub => 
        sub.name.toLowerCase().includes(subjectQuery.toLowerCase())
    );

    return (
<<<<<<< HEAD
<<<<<<< HEAD
        <div className="bg-gray-50 min-h-full">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end  border-b pb-4">
                <div className="space-y-1">
                    <button 
                        className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150 text-sm font-medium" 
                        onClick={onBack}
                    >
                        <ChevronLeft size={18} className="mr-1" /> Back to Activities
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
                    <p className="text-sm text-gray-500">{activity.subject} • Due {activity.dueDate}</p>
=======
        <div className="bg-slate-50/50 min-h-full p-1">
            <header className="flex flex-col gap-6 mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Submissions</h1>
                        <p className="text-slate-500 font-medium mt-1">Track and grade student work by subject.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search subjects..." 
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full sm:w-64 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm"
                                value={subjectQuery}
                                onChange={(e) => setSubjectQuery(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                    </div>
>>>>>>> Backup
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subjectGroup) => {
                        const percentDone = Math.round(((subjectGroup.totalSubmissions - subjectGroup.totalPendingReview) / subjectGroup.totalSubmissions) * 100);
                        
                        return (
                            <div 
                                key={subjectGroup.name} 
                                onClick={() => onSelectSubject(subjectGroup)}
                                className="group bg-white rounded-2xl px-3 py-2 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
                            >
                                {/* Progress Background Decoration */}
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <ClipboardCheck size={80} className="text-indigo-900" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {subjectGroup.name}
                                            </h4>
                                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                {subjectGroup.totalActivities} Activities
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex items-baseline gap-2">
                                            <h2 className="text-5xl font-black text-indigo-600 tracking-tighter">
                                                {subjectGroup.totalPendingReview}
                                            </h2>
                                            <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Pending</span>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                                <span>Grading Progress</span>
                                                <span>{percentDone}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${percentDone}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                        <div className="flex -space-x-2">
                                            {/* Mock Avatars for "Recently Submitted" feel */}
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                            ))}
                                            <div className="pl-4 text-xs font-bold text-slate-400">
                                                {subjectGroup.totalSubmissions} Total
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No subjects found matching "{subjectQuery}"</p>
                        <button onClick={() => setSubjectQuery('')} className="mt-2 text-indigo-600 font-bold hover:underline">Clear search</button>
                    </div>
                )}
            </div>
=======
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
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
        </div>
    );
};

export default ActivityList;