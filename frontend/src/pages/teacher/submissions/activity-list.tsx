import { ChevronRight, Filter, Search } from "lucide-react/dist/lucide-react";
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
        <div className=" bg-gray-50 min-h-full">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Submissions by Subject</h1>
                
                {/* Search and Filter Toolbar */}
                <div className="flex space-x-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search subjects..." 
                            className={inputClass} 
                            value={subjectQuery}
                            onChange={(e) => setSubjectQuery(e.target.value)}
                        />
                    </div>
                    <button className='flex items-center space-x-1 px-4 py-2 text-gray-700 border border-gray-300 bg-white rounded-lg hover:bg-gray-100 transition duration-150'>
                        <Filter size={16} /> <span>Filter</span>
                    </button>
                </div>
            </header>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subjectGroup) => (
                        <div 
                            key={subjectGroup.name} 
                            className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition duration-300 cursor-pointer flex flex-col justify-between"
                            onClick={() => onSelectSubject(subjectGroup)}
                        >
                            <div className="space-y-1 mb-4">
                                <h4 className="text-xl font-bold text-gray-800">{subjectGroup.name}</h4>
                                <p className="text-sm text-gray-500">{subjectGroup.totalActivities} Assignments/Quizzes</p>
                            </div>
                            
                            <div className="mb-4">
                                <h2 className="text-4xl font-extrabold text-blue-600">{subjectGroup.totalPendingReview}</h2>
                                <span className="text-sm font-semibold text-gray-600">Items Pending Review</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <p className="text-sm text-gray-500">Total Submissions: {subjectGroup.totalSubmissions}</p>
                                <ChevronRight size={18} className="text-gray-400" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-10 text-center bg-white rounded-xl shadow-lg text-gray-500">
                        No subjects found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityList;