import { ChevronLeft } from "lucide-react";
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
                </div>
                <button className="mt-4 sm:mt-0 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition duration-150">
                    Grade All
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-100">
                    Submissions ({submissionsCount}/{totalCount})
                </h3>
                
                <div className="overflow-x-auto rounded-b-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={tableHeaderClass}>Student Name</th>
                                <th scope="col" className={tableHeaderClass}>Student ID</th>
                                <th scope="col" className={tableHeaderClass}>Submitted At</th>
                                <th scope="col" className={tableHeaderClass}>Status</th>
                                <th scope="col" className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((s) => (
                                <tr key={s.studentId} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{s.studentName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{s.studentId}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{s.submittedAt}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`${pillClass} ${getStatusClass(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <button className='px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition duration-150'>
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {submissionsCount === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No submissions recorded for this activity yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivitySubmissions;