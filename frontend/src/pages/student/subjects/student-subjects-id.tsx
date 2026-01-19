'use client';
import { ArrowLeft, Download, Link2, PlayCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { subjects, assignments, quizzes, resources } from '../../../components/lib/data';


import { TaskList } from '../../../components/components/task-list';


export default function StudentSubjectpage() {
    const params = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tasks');
    const subject = subjects.find(s => s.id === params.id);

    if (!subject) {
        navigate("/not-found");
        return null;
    }

    

    const subjectTasks = assignments.filter(a => a.subjectId === subject.id);
    const subjectActivities = quizzes.filter(q => q.subjectId === subject.id);
    const subjectResources = resources.filter(r => r.subjectId === subject.id);

    return (
        <main className="p-1">
    {/* HEADER NAVIGATION */}
    <div className="flex items-center gap-4 mb-8">
        <Link 
            to="/student/subject"
            className='flex items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all'
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </Link>
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{subject.teacher}</p>
        </div>
    </div>

    {/* TOP STATS GRID - Re-styled to match your 'div' preference */}
    <div className="grid gap-6 md:grid-cols-3 mb-10">
        {/* Current Grade Div */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Grade</label>
            <div className="mt-4 flex items-baseline gap-2">
                <p className="text-5xl font-bold tracking-tighter text-slate-900">{subject.grade}</p>
                <span className="text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">Official SF9 entry</p>
        </div>

        {/* Progress Div */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Completion</label>
            <p className="text-5xl font-bold tracking-tighter mt-4 text-slate-900">{subject.progress}%</p>
            <div className="h-2.5 mt-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full transition-all duration-1000 ease-out bg-slate-900"
                    style={{ width: `${subject.progress}%` }}
                />
            </div>
        </div>

        {/* Total Tasks Div */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Count</label>
            <p className="text-5xl font-bold tracking-tighter mt-4 text-slate-900">{subjectTasks.length}</p>
            <p className="text-xs text-slate-500 mt-2 italic">Assignments & projects</p>
        </div>
    </div>

    {/* CUSTOM TAB NAVIGATION */}
    <div className="mb-6">
        <div className="flex gap-10 border-b border-slate-100 px-2">
            {['tasks', 'activities', 'resources'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    {tab}
                    {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-900 rounded-full" />
                    )}
                </button>
            ))}
        </div>
    </div>

    {/* MAIN CONTENT AREA */}
    <div className="rounded-[32px] border-2 border-slate-900 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 pb-6">
            <h2 className="text-4xl font-bold tracking-tighter text-slate-900 capitalize">
                {activeTab}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
                {activeTab === 'tasks' && `Review all submitted assignments for ${subject.name}.`}
                {activeTab === 'activities' && `Take your scheduled quizzes and exams.`}
                {activeTab === 'resources' && `Download learning modules and references.`}
            </p>
        </div>

        <div className="p-10 pt-0">
            {activeTab === 'tasks' && (
                <div className="mt-8 border-t border-slate-100 pt-8">
                    <TaskList subjectTasks={subjectTasks} />
                </div>
            )}

            {activeTab === 'activities' && (
                <div className="mt-8 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-900">
                                <th className="pb-5">Activity Title</th>
                                <th className="pb-5">Type</th>
                                <th className="pb-5">Due Date</th>
                                <th className="pb-5">Limit</th>
                                <th className="pb-5">Status</th>
                                <th className="pb-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subjectActivities.map((activity, i) => (
                                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                    <td className="py-6 font-bold text-slate-900">{activity.title}</td>
                                    <td className="py-6 text-sm text-slate-500 font-bold uppercase">{activity.type || 'Exam'}</td>
                                    <td className="py-6 text-sm text-slate-500">Sept 9, 2025</td>
                                    <td className="py-6 text-sm text-slate-500">30m</td>
                                    <td className="py-6">
                                        <span className="bg-[#fee2e2] text-[#991b1b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase">
                                            Not Taken
                                        </span>
                                    </td>
                                    <td className="py-6 text-right">
                                        <button className="inline-flex items-center gap-2 border-2 border-slate-900 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all">
                                            <PlayCircle className="h-4 w-4" />
                                            Start
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subjectResources.map((res, i) => (
                        <div key={i} className="p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-slate-900 transition-all flex flex-col justify-between h-full group">
                            <div className="flex gap-5 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <Link2 className="h-6 w-6 text-slate-900" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-slate-900 leading-tight">{res.title}</h4>
                                    <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-tighter">Module Reference</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 border-2 border-slate-900 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                <Download className="h-4 w-4" />
                                Open Link
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
</main>
    );
}
