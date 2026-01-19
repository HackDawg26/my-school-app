import React, { type Dispatch, type SetStateAction } from 'react';
import type { Student, Activity } from './GradeMockData'; // Assuming shared types
import { PlusSquare, Scale, TableProperties } from 'lucide-react';

interface GradeCell {
    value: string | number;
    manual?: boolean;
}

interface FixedSection {
    id: 'WW' | 'PT' | 'QA';
    label: string;
}

interface GradeTrackerUIProps {
    // Data & States
    dynamicStudents: Student[];
    wwActivities: Activity[];
    ptActivities: Activity[];
    qaActivities: Activity[];
    cells: Record<string, Record<string, GradeCell>>;
    weights: Record<string, number>;
    weightsSum: number;
    isTotalWeightValid: boolean;
    newActivityTitle: string;
    newActivityMax: string | number;
    newActivitySection: string;

    // Config/Constants
    FIXED_SECTIONS: FixedSection[];
    wwColSpan: number;
    ptColSpan: number;
    qaColSpan: number;
    style: Record<string, string>;
    inputClass: string;
    changedInputClass: string;
    primaryButton: string;

    // Functions
    to2: (n: number | string) => string;
    computeSectionAverage: (studentId: string, sectionKey: 'WW' | 'PT' | 'QA') => number;
    computeFinalGrade: (studentId: string) => number;
    handleChange: (studentId: string, activityId: string, value: string) => void;
    setWeights: Dispatch<SetStateAction<Record<string, number>>>;
    setNewActivityTitle: Dispatch<SetStateAction<string>>;
    setNewActivityMax: Dispatch<SetStateAction<string | number>>;
    setNewActivitySection: Dispatch<SetStateAction<string>>;
    addNewActivityColumn: (section: string, title: string, max: string | number) => void;
}

const GradeTrackerUI: React.FC<GradeTrackerUIProps> = ({
    dynamicStudents, wwActivities, ptActivities, qaActivities,
    cells, weights, weightsSum, isTotalWeightValid,
    newActivityTitle, newActivityMax, newActivitySection,
    FIXED_SECTIONS, wwColSpan, ptColSpan, qaColSpan,
    style, inputClass, changedInputClass, primaryButton,
    to2, computeSectionAverage, computeFinalGrade, handleChange,
    setWeights, setNewActivityTitle, setNewActivityMax,
    setNewActivitySection, addNewActivityColumn
}) => {

    // Helper to reduce JSX repetition in the table body
    const renderActivityCells = (stuId: string, activities: Activity[], sectionKey: 'WW' | 'PT' | 'QA') => {
        const items = [...activities, { id: `${sectionKey.toLowerCase()}Avg`, isAvg: true, title: 'Avg', max: 0 }];
        return items.map((a, i) => {
            const cell = cells[stuId]?.[a.id] || { value: '', manual: false };
            const isAvg = 'isAvg' in a && a.isAvg;

            return (
                <td 
                    key={`${sectionKey}-${stuId}-${a.id}`} 
                    className={isAvg ? style.avgCell : i === 0 ? `whitespace-nowrap px-1 py-2 ${style.sepLeft}` : "whitespace-nowrap px-3 py-2"}
                >
                    {isAvg ? (
                        <span className={`font-bold text-sm ${sectionKey === 'WW' ? 'text-blue-700' : sectionKey === 'PT' ? 'text-green-700' : 'text-purple-700'}`}>
                            {to2(computeSectionAverage(stuId, sectionKey))}%
                        </span>
                    ) : (
                        <input
                            className={`${inputClass} ${cell.manual ? changedInputClass : 'focus:border-blue-500'}`}
                            type="number"
                            min={0}
                            max={a.max}
                            value={cell.value === '' || cell.value == null ? '' : cell.value}
                            placeholder="0"
                            onChange={(e) => handleChange(stuId, a.id, e.target.value)}
                        />
                    )}
                </td>
            );
        });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-1">
            {/* Left: Grade Table Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden xl:col-span-3 flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <TableProperties size={18} className="text-indigo-500" />
                        Gradesheet Matrix
                    </h3>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">
                            <div className="h-2 w-2 rounded-full bg-blue-500"/> Written
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"/> Performance
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                            {/* Category Headers */}
                            <tr className="bg-slate-50">
                                <th rowSpan={2} className="sticky left-0 z-30 bg-slate-50 border-r border-b border-slate-200 p-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Student Name
                                </th>
                                <th colSpan={wwColSpan} className="border-b-4 border-blue-500 bg-blue-50/30 py-3 px-4 text-xs font-black text-blue-900 uppercase tracking-widest text-center">
                                    Written Works
                                </th>
                                <th colSpan={ptColSpan} className="border-b-4 border-emerald-500 bg-emerald-50/30 py-3 px-4 text-xs font-black text-emerald-900 uppercase tracking-widest text-center">
                                    Performance Tasks
                                </th>
                                <th colSpan={qaColSpan} className="border-b-4 border-purple-500 bg-purple-50/30 py-3 px-4 text-xs font-black text-purple-900 uppercase tracking-widest text-center">
                                    Assessments
                                </th>
                                <th rowSpan={2} className="sticky right-0 z-30 bg-slate-900 border-b border-slate-800 p-4 text-center text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                    Final
                                </th>
                            </tr>
                            {/* Sub-Headers (Individual Activities) */}
                            <tr className="bg-white">
                                {[...wwActivities, { id: 'wwAvg', title: 'Avg', isAvg: true, max: null }].map((a: any, i) => (
                                    <th 
                                        key={`ww-h-${a.id}`} 
                                        className={`border-b border-slate-200 p-2 text-[10px] font-bold text-slate-400 uppercase text-center 
                                            ${a.isAvg ? 'bg-blue-50/50 text-blue-600 border-l border-blue-100' : ''}`}
                                    >
                                        {/* Only show (max) if it's a number and not the Average column */}
                                        <div className="flex flex-col items-center">
                                            <span>{a.title}</span>
                                            {a.max !== null && a.max !== undefined && !a.isAvg && (
                                                <span className="text-[8px] opacity-60">({a.max})</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {/* Repeat logic for PT and QA */}
                                {[...ptActivities, { id: 'ptAvg', title: 'Avg', isAvg: true, max: null }].map((a: any, i) => (
                                    <th 
                                        key={`ww-h-${a.id}`} 
                                        className={`border-b border-slate-200 p-2 text-[10px] font-bold text-slate-400 uppercase text-center 
                                            ${a.isAvg ? 'bg-blue-50/50 text-blue-600 border-l border-blue-100' : ''}`}
                                    >
                                        {/* Only show (max) if it's a number and not the Average column */}
                                        <div className="flex flex-col items-center">
                                            <span>{a.title}</span>
                                            {a.max !== null && a.max !== undefined && !a.isAvg && (
                                                <span className="text-[8px] opacity-60">({a.max})</span>
                                            )}
                                        </div>
                                    </th>
                                ))}

                                {[...qaActivities, { id: 'qaAvg', title: 'Avg', isAvg: true, max: null }].map((a: any, i) => (
                                    <th 
                                        key={`ww-h-${a.id}`} 
                                        className={`border-b border-slate-200 p-2 text-[10px] font-bold text-slate-400 uppercase text-center 
                                            ${a.isAvg ? 'bg-blue-50/50 text-blue-600 border-l border-blue-100' : ''}`}
                                    >
                                        {/* Only show (max) if it's a number and not the Average column */}
                                        <div className="flex flex-col items-center">
                                            <span>{a.title}</span>
                                            {a.max !== null && a.max !== undefined && !a.isAvg && (
                                                <span className="text-[8px] opacity-60">({a.max})</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dynamicStudents.map(stu => (
                                <tr key={stu.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-100 p-3 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-800">{stu.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{stu.id}</p>
                                    </td>
                                    
                                    {/* Cells rendered via your renderActivityCells helper */}
                                    {renderActivityCells(stu.id, wwActivities, 'WW')}
                                    {renderActivityCells(stu.id, ptActivities, 'PT')}
                                    {renderActivityCells(stu.id, qaActivities, 'QA')}

                                    <td className="sticky right-0 z-20 bg-indigo-50 group-hover:bg-indigo-100 p-3 text-center">
                                        <span className="text-sm font-black text-indigo-700">
                                            {isTotalWeightValid ? to2(computeFinalGrade(stu.id)) : '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Right Sidebar */}
            <aside className="xl:col-span-1 space-y-6">
                {/* Weight Config Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Scale size={16} className="text-indigo-500" /> Weights
                        </h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isTotalWeightValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {to2(weightsSum * 100)}%
                        </span>
                    </div>
                    
                    <div className="space-y-4">
                        {FIXED_SECTIONS.map(section => (
                            <div key={section.id} className="group">
                                <div className="flex justify-between mb-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">{section.label}</label>
                                    <span className="text-[11px] font-mono text-slate-400">{(weights[section.id] * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" step="0.05" min="0" max="1"
                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    value={weights[section.id] ?? 0}
                                    onChange={(e) => setWeights(prev => ({ ...prev, [section.id]: Number(e.target.value) }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Activity Card */}
                <div className="bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 p-5 text-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <PlusSquare size={16} /> New Activity
                    </h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            className="w-full bg-indigo-700/50 border border-indigo-400/30 rounded-xl px-3 py-2 text-sm placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Activity Title"
                            value={newActivityTitle}
                            onChange={(e) => setNewActivityTitle(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                className="w-full bg-indigo-700/50 border border-indigo-400/30 rounded-xl px-3 py-2 text-sm focus:outline-none"
                                placeholder="Max"
                                value={newActivityMax}
                                onChange={(e) => setNewActivityMax(e.target.value)}
                            />
                            <select
                                className="w-full bg-indigo-700/50 border border-indigo-400/30 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                                value={newActivitySection}
                                onChange={(e) => setNewActivitySection(e.target.value)}
                            >
                                {FIXED_SECTIONS.map(section => (
                                    <option key={section.id} value={section.id} className="text-slate-900">{section.label}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            className="w-full bg-white text-indigo-600 font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
                            onClick={() => {
                                addNewActivityColumn(newActivitySection, newActivityTitle, newActivityMax);
                                setNewActivityTitle('');
                            }}
                        >
                            Add Column
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default GradeTrackerUI;