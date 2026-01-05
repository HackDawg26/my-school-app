import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
                </div>
            </header>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((act) => {
                        const submittedPercent = (act.submittedCount / act.totalCount) * 100;
                        const progressColor = submittedPercent < 50 ? 'bg-red-500' : (submittedPercent < 100 ? 'bg-yellow-500' : 'bg-green-500');

                        return (
                            <div 
                                key={act.id} 
                                className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition duration-300 cursor-pointer flex flex-col justify-between" 
                                onClick={() => onSelectActivity(act)}
                            >
                                <div className="space-y-1 mb-4">
                                    <h4 className="text-lg font-semibold text-gray-800">{act.title}</h4>
                                    <p className="text-xs text-gray-500">Due: {act.dueDate}</p>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${progressColor}`}
                                            style={{ width: `${submittedPercent}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">{act.submittedCount} of {act.totalCount} submitted</span>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Total Students: {act.totalCount}</p>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full p-10 text-center bg-white rounded-xl shadow-lg text-gray-500">
                        No activities match your search query in this subject.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectActivityList;