
import { ChevronRight, ClipboardCheck, Filter, Search } from "lucide-react";

import React, { useState, useMemo } from "react";

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
        </div>
    );
};

export default ActivityList;