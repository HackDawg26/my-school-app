<<<<<<< HEAD
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
=======
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";
>>>>>>> Backup
import React, { useState, type ChangeEvent } from "react";

// --- Interfaces ---

interface ExtendedActivity {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    totalCount: number;
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

interface SubjectActivityListProps {
    subject: SubjectGroup;
    onSelectActivity: any;
    onBack: () => void;
}

// --- Component ---

const SubjectActivityList = ({ subject, onSelectActivity, onBack }: SubjectActivityListProps) => {
    const activitiesWithCounts = subject.activities;

    const inputClass = "pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none w-full text-sm";
    
    // State typed for string
    const [activityQuery, setActivityQuery] = useState<string>('');

    const filteredActivities = activitiesWithCounts.filter(act => 
        act.title.toLowerCase().includes(activityQuery.toLowerCase())
    );

    return (
<<<<<<< HEAD
<<<<<<< HEAD
        <div className=" bg-gray-50 min-h-full">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 border-b pb-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                    <button 
                        className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150 text-sm font-medium" 
                        onClick={onBack}
                    >
                        <ChevronLeft size={18} className="mr-1" /> Back to Subjects
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{subject.name} Activities</h1>
                    <p className="text-sm text-gray-500">{activitiesWithCounts.length} Total Assignments/Quizzes</p>
                </div>
                
                {/* Search Toolbar */}
                <div className="toolbar w-full sm:w-64 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search activities..." 
                        className={inputClass} 
                        value={activityQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setActivityQuery(e.target.value)}
                    />
=======
=======
>>>>>>> Backup
        <div className="bg-slate-50/50 min-h-full p-1">
            {/* Navigation & Header */}
            <header className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div className="space-y-2">
                        <button 
                            onClick={onBack}
                            className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold tracking-tight uppercase" 
                        >
                            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> 
                            Back to Subjects
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                {subject.name}
                            </h1>
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
                                {activitiesWithCounts.length} Total
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">Manage and review student performance for this roster.</p>
                    </div>

                    {/* Enhanced Search */}
                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter by title..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm font-medium" 
                            value={activityQuery}
                            onChange={(e) => setActivityQuery(e.target.value)}
                        />
                    </div>
<<<<<<< HEAD
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
>>>>>>> Backup
                </div>
            </header>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((act) => {
                        const submittedPercent = (act.submittedCount / act.totalCount) * 100;
<<<<<<< HEAD
<<<<<<< HEAD
                        const progressColor = submittedPercent < 50 ? 'bg-red-500' : (submittedPercent < 100 ? 'bg-yellow-500' : 'bg-green-500');
=======
                        // Refined Color Palette
                        const barColor = submittedPercent < 50 ? 'bg-rose-500' : (submittedPercent < 100 ? 'bg-amber-500' : 'bg-emerald-500');
                        const isUrgent = act.submittedCount > 0 && submittedPercent < 100;
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                        // Refined Color Palette
                        const barColor = submittedPercent < 50 ? 'bg-rose-500' : (submittedPercent < 100 ? 'bg-amber-500' : 'bg-emerald-500');
                        const isUrgent = act.submittedCount > 0 && submittedPercent < 100;
>>>>>>> Backup

                        return (
                            <div 
                                key={act.id} 
<<<<<<< HEAD
<<<<<<< HEAD
                                className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition duration-300 cursor-pointer flex flex-col justify-between" 
=======
>>>>>>> Backup
                                onClick={() => onSelectActivity(act)}
                                className="group flex flex-col bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer relative"
                            >
                                {/* Type Indicator & Date */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded">
                                        {'Assignment'}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Calendar size={14} />
                                        <span className="text-xs font-bold tracking-tight">{act.dueDate}</span>
                                    </div>
                                </div>
<<<<<<< HEAD
                                
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Total Students: {act.totalCount}</p>
                                    <ChevronRight size={18} className="text-gray-400" />
=======
                                onClick={() => onSelectActivity(act)}
                                className="group flex flex-col bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer relative"
                            >
                                {/* Type Indicator & Date */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded">
                                        {'Assignment'}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Calendar size={14} />
                                        <span className="text-xs font-bold tracking-tight">{act.dueDate}</span>
                                    </div>
                                </div>
=======
>>>>>>> Backup

                                <h4 className="text-lg font-bold text-slate-800 mb-6 group-hover:text-indigo-600 transition-colors leading-snug">
                                    {act.title}
                                </h4>

                                {/* Submission Metric */}
                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submissions</p>
                                            <p className="text-xl font-black text-slate-800">
                                                {act.submittedCount}<span className="text-slate-300 font-bold mx-1">/</span>{act.totalCount}
                                            </p>
                                        </div>
                                        {isUrgent && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md animate-pulse">
                                                <AlertCircle size={12} /> Needs Review
                                            </span>
                                        )}
                                    </div>

                                    {/* Refined Progress Bar */}
                                    <div className="relative pt-1">
                                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100">
                                            <div
                                                style={{ width: `${submittedPercent}%` }}
                                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ${barColor}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Link Hint */}
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-indigo-600">Review Activity</span>
                                    <ChevronRight size={16} className="text-indigo-600" strokeWidth={3} />
<<<<<<< HEAD
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
>>>>>>> Backup
                                </div>
                            </div>
                        );
                    })
                ) : (
<<<<<<< HEAD
<<<<<<< HEAD
                    <div className="col-span-full p-10 text-center bg-white rounded-xl shadow-lg text-gray-500">
                        No activities match your search query in this subject.
=======
=======
>>>>>>> Backup
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 text-slate-400 shadow-inner">
                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <Inbox size={48} className="opacity-20" />
                        </div>
                        <p className="text-lg font-bold text-slate-600">No matching activities</p>
                        <p className="text-sm">Try adjusting your search terms for this subject.</p>
<<<<<<< HEAD
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
>>>>>>> Backup
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectActivityList;