import React, { type JSX } from 'react';
import { Link } from 'react-router-dom';
// Ensure these are exported from your GradeMockData file
import { SUBJECTS, ACTIVITIES_BY_SUBJECT, type Subject, type Activity } from './GradeMockData';



export default function SubjectChooser({ onSelect }: any): JSX.Element {
    return (
        <section className="bg-gray-50 min-h-screen p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUBJECTS.map((s: Subject) => {
                    // This allows us to safely access activities even if a subject ID isn't found
                    const activities: Activity[] = ACTIVITIES_BY_SUBJECT[s.id] || [];

                    return (
                        <article 
                            key={s.id} 
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl hover:border-blue-500 transition duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-1">
                                    {s.subject} 
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        • Grade {s.grade} • Section {s.section}
                                    </span>
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">Room {s.room}</p>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 mt-auto">
                                <Link 
                                    to={`/teacher/gradebook/${s.id}`}
                                    className="w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition duration-150 block"
                                    onClick={() => onSelect?.(s)}
                                >
                                    Open Gradebook
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}