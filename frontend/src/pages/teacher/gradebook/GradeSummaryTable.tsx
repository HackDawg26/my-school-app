import React from 'react';
import type { Student, Activity } from './GradeMockData';

// Interface for the cell state (manual vs calculated)
interface GradeCell {
    value: string | number;
    manual?: boolean;
}

// Interface for the style object passed from the parent
interface TableStyles {
    groupHeader: string;
    subHeader: string;
    avgHeader: string;
    avgCell: string;
    sepLeft: string;
}

interface GradeSummaryTableProps {
    // Data & State
    dynamicStudents: Student[];
    wwActivities: Activity[];
    ptActivities: Activity[];
    qaActivities: Activity[];
    cells: Record<string, Record<string, GradeCell>>;
    isTotalWeightValid: boolean;

    // Config/Style
    wwColSpan: number;
    ptColSpan: number;
    qaColSpan: number;
    style: TableStyles;

    // Functions
    to2: (n: number | string) => string;
    computeSectionAverage: (studentId: string, sectionKey: 'WW' | 'PT' | 'QA') => number;
    computeFinalGrade: (studentId: string) => number;
}

const GradeSummaryTable: React.FC<GradeSummaryTableProps> = ({
    dynamicStudents,
    wwActivities,
    ptActivities,
    qaActivities,
    cells,
    isTotalWeightValid,
    wwColSpan,
    ptColSpan,
    qaColSpan,
    style,
    to2,
    computeSectionAverage,
    computeFinalGrade
}) => {
    
    // Helper to render activity headers with a consistent pattern
    const renderHeaderGroup = (activities: Activity[], type: string) => {
        const headers = [...activities, { id: `${type}Avg`, title: 'Avg', isAvg: true, max: 0 }];
        return headers.map((a, i) => (
            <th 
                key={`${type}-h-${a.id}`} 
                className={(a as any).isAvg ? `${style.avgHeader}` : i === 0 ? `${style.subHeader} ${style.sepLeft}` : style.subHeader}
            >
                {a.title} {(a as any).isAvg ? '' : `(${a.max})`}
            </th>
        ));
    };

    return (
        <section className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'>
            <table className='w-full text-sm text-left border-collapse'>
                <thead className="bg-gray-100">
                    {/* Row 1: Fixed Section Groups */}
                    <tr>
                        <th rowSpan={2} className="sticky left-0 z-10 w-5 text-left text-xs font-bold text-gray-800 uppercase tracking-wider px-3 py-3 border-r border-gray-300 bg-gray-100">
                            Student
                        </th>
                        <th colSpan={wwColSpan} className={`${style.groupHeader} ${style.sepLeft} text-blue-900`}>Written Works</th>
                        <th colSpan={ptColSpan} className={`${style.groupHeader} ${style.sepLeft} text-green-600`}>Performance Tasks</th>
                        <th colSpan={qaColSpan} className={`${style.groupHeader} ${style.sepLeft} text-purple-600`}>Quarterly Assessment</th>
                        <th rowSpan={2} className="sticky right-0 bg-red-600 z-30 w-24 text-center text-xs font-bold text-white uppercase tracking-wider px-3 py-3 border-l border-gray-300">
                            FINAL GRADE
                        </th>
                    </tr>
                    
                    {/* Row 2: Activity/Average Headers */}
                    <tr>
                        {renderHeaderGroup(wwActivities, 'ww')}
                        {renderHeaderGroup(ptActivities, 'pt')}
                        {renderHeaderGroup(qaActivities, 'qa')}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {dynamicStudents.map(stu => (
                        <tr key={stu.id} className="hover:bg-gray-50 transition duration-100 group">
                            {/* Student Name */}
                            <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-20 w-48 whitespace-nowrap px-4 py-3 text-sm border-r border-gray-200">
                                <strong className="text-gray-900">{stu.name}</strong>
                                <div className="text-xs text-gray-500">{stu.id}</div>
                            </td>
                            
                            {/* Data Rendering Sections */}
                            {(['WW', 'PT', 'QA'] as const).map((sectionKey) => {
                                const activities = sectionKey === 'WW' ? wwActivities : sectionKey === 'PT' ? ptActivities : qaActivities;
                                const sectionId = sectionKey.toLowerCase();
                                
                                return (
                                    <React.Fragment key={`${stu.id}-${sectionId}-group`}>
                                        {activities.map((a, i) => {
                                            const cell = cells[stu.id]?.[a.id] || { value: '', manual: false };
                                            return (
                                                <td key={`${sectionId}-${stu.id}-${a.id}`} className={`text-center whitespace-nowrap px-3 py-3 text-sm ${i === 0 ? style.sepLeft : ""}`}>
                                                    <span className={`${cell.manual ? 'text-orange-600 font-semibold' : 'text-gray-700'}`}>
                                                        {cell.value === '' || cell.value == null ? '0' : cell.value}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        {/* Average Cell for Section */}
                                        <td className={`text-center whitespace-nowrap px-3 py-3 text-sm ${style.avgCell}`}>
                                            <span className={`font-bold ${sectionKey === 'WW' ? 'text-blue-700' : sectionKey === 'PT' ? 'text-green-700' : 'text-purple-700'}`}>
                                                {to2(computeSectionAverage(stu.id, sectionKey))}%
                                            </span>
                                        </td>
                                    </React.Fragment>
                                );
                            })}
                            
                            {/* Final Grade */}
                            <td className="sticky right-0 bg-red-100 z-20 w-24 text-center whitespace-nowrap px-3 py-3 text-sm font-extrabold text-red-800 border-l border-gray-200">
                                {isTotalWeightValid ? to2(computeFinalGrade(stu.id)) : '---'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default GradeSummaryTable;