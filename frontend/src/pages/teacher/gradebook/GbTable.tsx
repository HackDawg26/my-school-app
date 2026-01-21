import React, { useState, useMemo, useEffect } from 'react';
import { 
    SUBJECTS, 
    STUDENTS_BY_SUBJECT, 
    ACTIVITIES_BY_SUBJECT, 
    ACTIVITY_SCORES, 
    MOCK_QUARTERLY_ID, 
    MOCK_QUARTERLY_MAX, 
    generateQuarterlyScore, 
    byCategory, 
    to2, 
    FIXED_SECTION_MAP, 
    FIXED_SECTIONS,
  
} from './GradeMockData';
import GradeTrackerUI from './ManualEditGrade';
import GradeSummaryTable from './GradeSummaryTable';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { ChevronLeft, Settings } from 'lucide-react';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
import { ChevronLeft, Settings } from 'lucide-react';
>>>>>>> Backup

// --- Interfaces ---

interface Student {
    id: string;
    name: string;
}

interface Activity {
    id: string;
    title: string;
    cat: string;
    max: number;
}

interface FixedSection {
    id: 'WW' | 'PT' | 'QA';
    label: string;
}

interface CellData {
    value: number | string;
    manual: boolean;
}

interface GradeCells {
    [studentId: string]: {
        [activityId: string]: CellData;
    };
}

interface Weights {
    WW: number;
    PT: number;
    QA: number;
    [key: string]: number; // Allow indexing by string for dynamic access
}

interface ComplexGradebookTableProps {
    selected: string;
    onBack: () => void;
}

let activityCounter = 10;

export const ComplexGradebookTable: React.FC<ComplexGradebookTableProps> = ({ selected, onBack }) => {
    // Weights are now tied to the FIXED SECTIONS (WW, PT, QA)
    const [weights, setWeights] = useState<Weights>({ WW: 0.40, PT: 0.40, QA: 0.20 });
    const [cells, setCells] = useState<GradeCells>({});

    // ** State for dynamic content **
    const [dynamicActivities, setDynamicActivities] = useState<Activity[]>(ACTIVITIES_BY_SUBJECT[selected] || []);
    const [dynamicStudents, setDynamicStudents] = useState<Student[]>(STUDENTS_BY_SUBJECT[selected] || []);

    // Static data from props and mock layer
    const subjectInfo = SUBJECTS.find(s => s.id === selected);

    // Combine activities: Base + Mock Quarterly
    const activities = useMemo<Activity[]>(() => {
        const hasQuarterly = dynamicActivities.some(a => a.id === MOCK_QUARTERLY_ID);
        const base = [...dynamicActivities];
        if (!hasQuarterly) {
            base.push({ id: MOCK_QUARTERLY_ID, title: 'Quarterly Exam', cat: 'Quarterly', max: MOCK_QUARTERLY_MAX });
        }
        return base;
    }, [dynamicActivities]);

    const activitiesByCategory = useMemo(() => byCategory(activities), [activities]);

    // Filter activities into their fixed sections for display
    const wwActivities = activities.filter(a => FIXED_SECTION_MAP.WW.includes(a.cat));
    const ptActivities = activities.filter(a => FIXED_SECTION_MAP.PT.includes(a.cat));
    const qaActivities = activities.filter(a => FIXED_SECTION_MAP.QA.includes(a.cat));

    // Calculate ColSpans
    const wwColSpan = wwActivities.length + 1;
    const ptColSpan = ptActivities.length + 1;
    const qaColSpan = qaActivities.length + 1;

    useEffect(() => {
        setDynamicActivities(ACTIVITIES_BY_SUBJECT[selected] || []);
        setDynamicStudents(STUDENTS_BY_SUBJECT[selected] || []);
    }, [selected]);

    useEffect(() => {
        const seeded: GradeCells = {};
        for (const stu of dynamicStudents) {
            const row: { [key: string]: CellData } = {};
            const scoreRow = ACTIVITY_SCORES[selected]?.[stu.id] || {};
            
            for (const act of activities) {
                let val: number | null;
                if (act.id === MOCK_QUARTERLY_ID) {
                    val = generateQuarterlyScore(stu.id);
                } else {
                    val = scoreRow[act.id] ?? null;
                }

                const existingCell = cells[stu.id]?.[act.id];
                if (existingCell) {
                    row[act.id] = existingCell;
                } else {
                    row[act.id] = {
                        value: val != null ? val : 0,
                        manual: val != null,
                    };
                }
            }
            seeded[stu.id] = row;
        }
        setCells(seeded);
    }, [selected, dynamicStudents, activities]);

    const handleChange = (studentId: string, actId: string, val: string) => {
        const num = val === '' ? '' : Math.max(0, Number(val));
        setCells(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [actId]: { value: num, manual: num !== '' && num != null },
            }
        }));
    };

    const addNewActivityColumn = (sectionId: string, title: string, max: string | number) => {
        const maxScore = Number(max);
        if (!title || maxScore <= 0) return alert("Please enter a valid title and max score.");

        const sectionInfo = FIXED_SECTIONS.find(s => s.id === sectionId);
        if (!sectionInfo) return;

        const defaultCategory = sectionInfo.category;
        const newId = `A-${activityCounter++}`;

        const newActivity: Activity = {
            id: newId,
            title: title,
            cat: defaultCategory,
            max: maxScore
        };

        setDynamicActivities(prev => [...prev, newActivity]);

        setCells(prevCells => {
            const nextCells = { ...prevCells };
            for (const studentId in nextCells) {
                nextCells[studentId] = {
                    ...nextCells[studentId],
                    [newId]: { value: 0, manual: false }
                };
            }
            return nextCells;
        });
    };

    const computeSectionAverage = (studentId: string, sectionId: string): number => {
        const categoriesInSection = FIXED_SECTION_MAP[sectionId as keyof typeof FIXED_SECTION_MAP] || [];
        let earnedSum = 0;
        let possibleSum = 0;

        for (const cat of categoriesInSection) {
            const acts = activitiesByCategory.get(cat) || [];
            let catEarned = 0;
            let catPossible = 0;

            for (const a of acts) {
                const v = cells[studentId]?.[a.id]?.value;
                if (v !== undefined && v !== null && v !== '') {
                    catEarned += Number(v);
                    catPossible += a.max;
                }
            }
            earnedSum += catEarned;
            possibleSum += catPossible;
        }

        return possibleSum === 0 ? 0 : (earnedSum / possibleSum) * 100;
    };

    const computeFinalGrade = (studentId: string): number => {
        let sum = 0;
        let totalWeight = 0;

        for (const section of FIXED_SECTIONS) {
            const w = Number(weights[section.id] || 0);
            const avg = computeSectionAverage(studentId, section.id);
            sum += avg * w;
            totalWeight += w;
        }

        return Math.abs(totalWeight - 1.00) > 0.001 ? 0 : sum;
    };

    const weightsSum = Object.values(weights).reduce((s, v) => s + Number(v || 0), 0);
    const isTotalWeightValid = Math.abs(weightsSum - 1.00) < 0.001;

    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityMax, setNewActivityMax] = useState<string | number>(10);
    const [newActivitySection, setNewActivitySection] = useState('WW');

    // UI Helpers
    const baseButton = "px-1 py-2 text-sm font-medium rounded-lg transition duration-150 shadow-sm";
    const primaryButton = `${baseButton} bg-blue-600 text-white hover:bg-blue-700`;
    const secondaryButton = `${baseButton} bg-white text-gray-700 border border-gray-300 hover:bg-gray-100`;
    const inputClass = "w-full text-center text-sm py-1 border border-gray-100 rounded-md focus:border-blue-500 focus:ring-blue-500";
    const changedInputClass = " focus:border-yellow-700";

    const style = {
        groupHeader: " text-center font-bold text-xs uppercase tracking-wider py-1",
        subHeader: "text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-1",
        avgHeader: "text-center text-xs font-bold text-red-500 uppercase tracking-wider ",
        avgCell: "whitespace-nowrap text-sm text-center font-bold text-red-700 bg-red-50",
        sepLeft: "border-l-1 border-gray-200",
    };

    const [isEditing, setIsEditing] = useState(false);
    const handleEditClick = () => {
        const confirmEdit = window.confirm("Are you sure you want to modify this grade? This action will be logged.");
        if (confirmEdit) setIsEditing(true);
    };

    return (
<<<<<<< HEAD
<<<<<<< HEAD
        <section className="bg-gray-100 min-h-screen m-0">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                    <button className={secondaryButton} onClick={onBack}>← Back to Subjects</button>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {subjectInfo?.subject} <span className="text-base font-normal text-gray-500">• {selected}</span>
                    </h2>
                    <button className='text-xs bg-green-500 text-white px-2 py-1 rounded' onClick={handleEditClick}>
                        edit
                    </button>
                </div>
            </header>

            {isEditing ? (
                <GradeTrackerUI
                    dynamicStudents={dynamicStudents}
                    wwActivities={wwActivities}
                    ptActivities={ptActivities}
                    qaActivities={qaActivities}
                    cells={cells}
                    weights={weights}
                    weightsSum={weightsSum}
                    isTotalWeightValid={isTotalWeightValid}
                    newActivityTitle={newActivityTitle}
                    newActivityMax={newActivityMax}
                    newActivitySection={newActivitySection}
                    FIXED_SECTIONS={FIXED_SECTIONS as FixedSection[]}
                    wwColSpan={wwColSpan}
                    ptColSpan={ptColSpan}
                    qaColSpan={qaColSpan}
                    style={style}
                    inputClass={inputClass}
                    changedInputClass={changedInputClass}
                    primaryButton={primaryButton}
                    to2={to2}
                    computeSectionAverage={computeSectionAverage}
                    computeFinalGrade={computeFinalGrade}
                    handleChange={handleChange}
                    setWeights={setWeights as React.Dispatch<React.SetStateAction<Record<string, number>>>}
                    setNewActivityTitle={setNewActivityTitle}
                    setNewActivityMax={setNewActivityMax}
                    setNewActivitySection={setNewActivitySection}
                    addNewActivityColumn={addNewActivityColumn}
                />
            ) : (
                <GradeSummaryTable
                    dynamicStudents={dynamicStudents}
                    wwActivities={wwActivities}
                    ptActivities={ptActivities}
                    qaActivities={qaActivities}
                    cells={cells}
                    isTotalWeightValid={isTotalWeightValid}
                    wwColSpan={wwColSpan}
                    ptColSpan={ptColSpan}
                    qaColSpan={qaColSpan}
                    style={style}
                    to2={to2}
                    computeSectionAverage={computeSectionAverage}
                    computeFinalGrade={computeFinalGrade}
                />
            )}
=======
        <section className="bg-slate-50 min-h-screen">
            {/* Clean, Functional Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm mb-6">
                <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <button 
                            className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider transition-colors mb-1" 
                            onClick={onBack}
                        >
                            <ChevronLeft size={14} className="mr-1" /> 
                            Back to Gradebooks
                        </button>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {subjectInfo?.subject}
                            </h2>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-sm font-medium border border-slate-200">
                                {selected}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Visual Toggle for Edit Mode */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button 
                                onClick={() => isEditing && handleEditClick()} 
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!isEditing ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Preview
                            </button>
                            <button 
                                onClick={() => !isEditing && handleEditClick()} 
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Edit Mode
                            </button>
                        </div>
                        
                        {/* Secondary Actions */}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </header>

=======
        <section className="bg-slate-50 min-h-screen">
            {/* Clean, Functional Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm mb-6">
                <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <button 
                            className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider transition-colors mb-1" 
                            onClick={onBack}
                        >
                            <ChevronLeft size={14} className="mr-1" /> 
                            Back to Gradebooks
                        </button>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {subjectInfo?.subject}
                            </h2>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-sm font-medium border border-slate-200">
                                {selected}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Visual Toggle for Edit Mode */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button 
                                onClick={() => isEditing && handleEditClick()} 
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!isEditing ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Preview
                            </button>
                            <button 
                                onClick={() => !isEditing && handleEditClick()} 
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Edit Mode
                            </button>
                        </div>
                        
                        {/* Secondary Actions */}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </header>

>>>>>>> Backup
            {/* Main Content Area */}
            <div className="px-6 max-w-[1600px] mx-auto">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                    {isEditing ? (
                        <div className="animate-in fade-in duration-300">
                        <GradeTrackerUI
                            dynamicStudents={dynamicStudents}
                            wwActivities={wwActivities}
                            ptActivities={ptActivities}
                            qaActivities={qaActivities}
                            cells={cells}
                            weights={weights}
                            weightsSum={weightsSum}
                            isTotalWeightValid={isTotalWeightValid}
                            newActivityTitle={newActivityTitle}
                            newActivityMax={newActivityMax}
                            newActivitySection={newActivitySection}
                            FIXED_SECTIONS={FIXED_SECTIONS as FixedSection[]}
                            wwColSpan={wwColSpan}
                            ptColSpan={ptColSpan}
                            qaColSpan={qaColSpan}
                            style={style}
                            inputClass={inputClass}
                            changedInputClass={changedInputClass}
                            primaryButton={primaryButton}
                            to2={to2}
                            computeSectionAverage={computeSectionAverage}
                            computeFinalGrade={computeFinalGrade}
                            handleChange={handleChange}
                            setWeights={setWeights as React.Dispatch<React.SetStateAction<Record<string, number>>>}
                            setNewActivityTitle={setNewActivityTitle}
                            setNewActivityMax={setNewActivityMax}
                            setNewActivitySection={setNewActivitySection}
                            addNewActivityColumn={addNewActivityColumn}
                        />
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-2 duration-300">
                            <GradeSummaryTable
                                {...{
                                    dynamicStudents, wwActivities, ptActivities, qaActivities,
                                    cells, isTotalWeightValid, wwColSpan, ptColSpan,
                                    qaColSpan, style, to2, computeSectionAverage, computeFinalGrade
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
<<<<<<< HEAD
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
>>>>>>> Backup
        </section>
    );
};