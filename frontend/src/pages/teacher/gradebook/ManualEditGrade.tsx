import React, { type Dispatch, type SetStateAction } from 'react';
import type { Student, Activity } from './GradeMockData'; // Assuming shared types

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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left: Grade Table Section */}
            <section className="bg-white rounded-xl shadow-lg p-6 xl:col-span-3">
                <div className="overflow-x-auto rounded-sm border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th rowSpan={2} className="sticky left-0 z-20 bg-gray-100 w-20 min-w-20 text-left text-xs font-bold text-gray-800 uppercase tracking-wider px-3 py-3 border-r border-gray-300">Student</th>
                                <th colSpan={wwColSpan} className={`${style.groupHeader} ${style.sepLeft} text-blue-900`}>Written Works</th>
                                <th colSpan={ptColSpan} className={`${style.groupHeader} ${style.sepLeft} text-green-600`}>Performance Tasks</th>
                                <th colSpan={qaColSpan} className={`${style.groupHeader} ${style.sepLeft} text-purple-600`}>Quarterly Assessment</th>
                                <th rowSpan={2} className="sticky right-0 bg-red-600 z-20 w-15 text-center text-xs font-bold text-white uppercase tracking-wider px-3 py-3 border-l border-gray-300">FINAL GRADE</th>
                            </tr>
                            <tr>
                                {/* Header Labels Logic Kept Consistent */}
                                {[...wwActivities, { id: 'wwAvg', title: 'Avg', isAvg: true, max: 0 }].map((a, i) => (
                                    <th key={`ww-h-${a.id}`} className={(a as any).isAvg ? style.avgHeader : i === 0 ? `${style.subHeader} ${style.sepLeft}` : style.subHeader}>
                                        {a.title} {(a as any).isAvg ? '' : `(${a.max})`}
                                    </th>
                                ))}
                                {/* ... Repeat for PT and QA Headers as needed or map over FIXED_SECTIONS */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dynamicStudents.map(stu => (
                                <tr key={stu.id} className="hover:bg-gray-50 transition duration-100 group">
                                    <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-20 w-25 whitespace-nowrap px-1 py-1 text-sm border-r border-gray-200">
                                        <strong className="text-gray-900">{stu.name}</strong>
                                        <div className="text-xs text-gray-500">{stu.id}</div>
                                    </td>
                                    
                                    {renderActivityCells(stu.id, wwActivities, 'WW')}
                                    {renderActivityCells(stu.id, ptActivities, 'PT')}
                                    {renderActivityCells(stu.id, qaActivities, 'QA')}

                                    <td className="sticky right-0 bg-red-100 z-20 w-24 text-center whitespace-nowrap px-3 py-3 text-sm font-extrabold text-red-800 border-l border-gray-200">
                                        {isTotalWeightValid ? to2(computeFinalGrade(stu.id)) : '---'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Right: Weights and Controls */}
            <aside className="xl:col-span-1 h-fit space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 mt-0">Section Weights</h3>
                    <p className={`text-sm mb-4 ${isTotalWeightValid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                        Total Weight: {to2(weightsSum)} / 1.00 ({isTotalWeightValid ? 'Valid' : 'Invalid'})
                    </p>
                    <div className="space-y-3">
                        {FIXED_SECTIONS.map(section => (
                            <div className="flex items-center justify-between" key={`w-${section.id}`}>
                                <label className="w-40 font-bold text-gray-700 text-sm">{section.label} Weight</label>
                                <input
                                    className="w-24 text-right text-sm px-2 py-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                                    type="number" step="0.05" min="0" max="1"
                                    value={weights[section.id] ?? 0}
                                    onChange={(e) => setWeights(prev => ({ ...prev, [section.id]: Number(e.target.value) }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Add Activity Column</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g., Quiz 3"
                                value={newActivityTitle}
                                onChange={(e) => setNewActivityTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={newActivityMax}
                                onChange={(e) => setNewActivityMax(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                                value={newActivitySection}
                                onChange={(e) => setNewActivitySection(e.target.value)}
                            >
                                {FIXED_SECTIONS.map(section => (
                                    <option key={section.id} value={section.id}>{section.label}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            className={primaryButton + " w-full mt-2"}
                            onClick={() => {
                                addNewActivityColumn(newActivitySection, newActivityTitle, newActivityMax);
                                setNewActivityTitle('');
                                setNewActivityMax(10);
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