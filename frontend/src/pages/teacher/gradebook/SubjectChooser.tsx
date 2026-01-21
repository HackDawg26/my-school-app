import React, { type JSX } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { Link } from 'react-router-dom';
// Ensure these are exported from your GradeMockData file
import { SUBJECTS, ACTIVITIES_BY_SUBJECT, type Subject, type Activity } from './GradeMockData';
=======
import { Link, useNavigate } from 'react-router-dom';
// Ensure these are exported from your GradeMockData file
import { SUBJECTS, ACTIVITIES_BY_SUBJECT, type Subject, type Activity } from './GradeMockData';
import { Book, CheckCircle, ChevronRight, LayoutGrid, ClipboardList } from 'lucide-react';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
import { Link, useNavigate } from 'react-router-dom';
// Ensure these are exported from your GradeMockData file
import { SUBJECTS, ACTIVITIES_BY_SUBJECT, type Subject, type Activity } from './GradeMockData';
import { Book, CheckCircle, ChevronRight, LayoutGrid, ClipboardList } from 'lucide-react';
>>>>>>> Backup



export default function SubjectChooser({ onSelect }: any): JSX.Element {
<<<<<<< HEAD
<<<<<<< HEAD
=======
    const navigate = useNavigate();
    
>>>>>>> Backup
    return (
        <section className="bg-slate-50/50 min-h-screen p-1">
            {/* Quick Actions Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/teacher/grades/quarterly')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <ClipboardList size={18} />
                        Manage Quarterly Grades
                    </button>
                </div>
            </div>

            {/* Grid adjusted for more columns (up to 5 on large screens) */}
            <div className="flex flex-wrap gap-4">
                {SUBJECTS.map((s: Subject) => {
                    const activities: Activity[] = ACTIVITIES_BY_SUBJECT[s.id] || [];
<<<<<<< HEAD
=======
    const navigate = useNavigate();
    
    return (
        <section className="bg-slate-50/50 min-h-screen p-1">
            {/* Quick Actions Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/teacher/grades/quarterly')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <ClipboardList size={18} />
                        Manage Quarterly Grades
                    </button>
                </div>
            </div>

            {/* Grid adjusted for more columns (up to 5 on large screens) */}
            <div className="flex flex-wrap gap-4">
                {SUBJECTS.map((s: Subject) => {
                    const activities: Activity[] = ACTIVITIES_BY_SUBJECT[s.id] || [];
                    const lastModified = "2h ago"; 
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
                    const lastModified = "2h ago"; 
>>>>>>> Backup

                    return (
                        <article 
                            key={s.id} 
<<<<<<< HEAD
<<<<<<< HEAD
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl hover:border-blue-500 transition duration-300 flex flex-col justify-between"
=======
                            /* Added 'flex-1' and 'min-w' to control box sizing in the flex row */
                            className="group flex flex-col bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all duration-200 cursor-pointer flex-1 min-w-[240px] max-w-[400px]"
                            onClick={() => onSelect?.(s)}
>>>>>>> Backup
                        >
                            {/* Compact Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                    <Book size={16} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Room {s.room}
                                </span>
                            </div>

                            {/* Subject Info */}
                            <div className="mb-4">
                                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {s.subject}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    Gr. {s.grade} • Sec. {s.section}
                                </p>
                            </div>

                            {/* Mini Stats Row */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="flex flex-col border-l-2 border-slate-100 pl-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Activities</span>
                                    <span className="text-xs font-bold text-slate-700">{activities.length}</span>
                                </div>
                                <div className="flex flex-col border-l-2 border-slate-100 pl-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Updated</span>
                                    <span className="text-xs font-bold text-slate-500">{lastModified}</span>
                                </div>
                            </div>
                            
<<<<<<< HEAD
                            <div className="pt-4 border-t border-gray-100 mt-auto">
                                <Link 
                                    to={`/teacher/gradebook/${s.id}`}
                                    className="w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition duration-150 block"
                                    onClick={() => onSelect?.(s)}
                                >
                                    Open Gradebook
                                </Link>
                            </div>
=======
                            /* Added 'flex-1' and 'min-w' to control box sizing in the flex row */
                            className="group flex flex-col bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all duration-200 cursor-pointer flex-1 min-w-[240px] max-w-[400px]"
                            onClick={() => onSelect?.(s)}
                        >
                            {/* Compact Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                    <Book size={16} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Room {s.room}
                                </span>
                            </div>

                            {/* Subject Info */}
                            <div className="mb-4">
                                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {s.subject}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    Gr. {s.grade} • Sec. {s.section}
                                </p>
                            </div>

                            {/* Mini Stats Row */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="flex flex-col border-l-2 border-slate-100 pl-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Activities</span>
                                    <span className="text-xs font-bold text-slate-700">{activities.length}</span>
                                </div>
                                <div className="flex flex-col border-l-2 border-slate-100 pl-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Updated</span>
                                    <span className="text-xs font-bold text-slate-500">{lastModified}</span>
                                </div>
                            </div>
                            
=======
>>>>>>> Backup
                            {/* Action Button */}
                            <Link 
                                to={`/teacher/gradebook/${s.id}`}
                                className="mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-all"
                            >
                                View Gradebook
                                <ChevronRight size={14} />
                            </Link>
<<<<<<< HEAD
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
>>>>>>> Backup
                        </article>
                    );
                })}
            </div>
        </section>
    );
}