/*
    this page shows the student dashboard page
    which includes greetings, average grade for the current semester, 
    list of subjects and their grades on every activities.
*/

import { ChevronRight, ClipboardCheck } from "lucide-react";
import { SubjectVisual } from "../student_components/subjectVisual";
import { SemesterPicker } from "../student_components/semesterPicker";
import { PortalSnapshot } from "../student_types/portal";

interface DashboardPageProps {
  data: PortalSnapshot;
  selectedSemesterId: string;
  onSemesterChange: (semesterId: string) => void;
  onViewSubjects: () => void;
  onViewGrades: () => void;
}

export function StudentDashboardPage({
    data,
    selectedSemesterId,
    onSemesterChange,
    onViewSubjects,
    onViewGrades,
}: DashboardPageProps) {
    const selectedSemester = data.semesters.find((semester) => semester.id === selectedSemesterId) ?? data.semesters[0];
    const average = data.gradeReports.find((report) => report.semesterId === selectedSemesterId)?.average ?? 0;
    const ringDegrees = Math.max(0, Math.min(360, average * 3.6));
    
    return (
        <div>
            <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                <p className="text-sm font-medium text-slate-500">Good morning,</p>
                <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-[44px]">
                    {data.student.first_name}! <span className="text-[34px]">👋</span>
                </h1>
                <p className="mt-3 text-sm font-medium text-slate-500">
                    <span className="px-1">•</span> {data.student.year_level}
                </p>
                </div>
                <SemesterPicker
                semesters={data.semesters}
                value={selectedSemesterId}
                onChange={onSemesterChange}
                showAcademicYear
                />
            </header>

            <div className="mt-8 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="text-lg font-extrabold tracking-[-0.025em] text-slate-950">Current Semester Average</h2>
                <div className="mt-8 grid place-items-center">
                    <div
                    className="grid size-[218px] place-items-center rounded-full p-[10px]"
                    style={{
                        background: `conic-gradient(#5b4cf6 0deg ${ringDegrees * 0.72}deg, #7f6ff6 ${ringDegrees * 0.72}deg ${ringDegrees}deg, #ddd9ff ${ringDegrees}deg 360deg)`,
                    }}
                    >
                    <div className="grid size-full place-items-center rounded-full bg-white shadow-inner">
                        <div className="text-center">
                        <div className="text-[42px] font-extrabold tracking-[-0.04em] text-slate-950">
                            {average?.toFixed(2) ?? '--'}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">Out of 100</div>
                        <div className="mt-4 text-base font-bold text-emerald-600">
                            {average ? 'Excellent' : 'No grade yet'}
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>

                <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-extrabold tracking-[-0.025em] text-slate-950">Current Subjects</h2>
                    <button type="button" onClick={onViewSubjects} className="text-sm font-bold text-[#5b4cf6] hover:text-[#4433de]">
                    View all
                    </button>
                </div>
                <div className="mt-5 divide-y divide-slate-100">
                    {data.subjects.map((subject) => (
                    <button
                        type="button"
                        onClick={onViewSubjects}
                        key={subject.id}
                        className="flex w-full items-center gap-4 py-4 text-left transition hover:translate-x-0.5"
                    >
                        <SubjectVisual accent={subject.accent} size="sm"  />
                        <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-extrabold text-slate-950">{subject.subjectName}</div>
                        <div className="mt-1 truncate text-sm text-slate-500">{subject.teacherName}</div>
                        </div>
                        <ChevronRight className="size-5 text-slate-400" />
                    </button>
                    ))}
                </div>
                </section>
            </div>

            <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-extrabold tracking-[-0.025em] text-slate-950">Recently Posted Grades</h2>
                <button type="button" onClick={onViewGrades} className="text-sm font-bold text-[#5b4cf6] hover:text-[#4433de]">
                    View all
                </button>
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                {/* {data.recentGrades.map((grade) => (
                    <button
                    type="button"
                    onClick={onViewGrades}
                    key={grade.id}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left sm:grid-cols-[auto_1fr_auto_120px_auto]"
                    >
                    <div className={`grid size-11 place-items-center rounded-full ${gradeAccent[grade.accent]}`}>
                        <ClipboardCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[15px] font-extrabold text-slate-950">{grade.title}</div>
                        <div className="mt-0.5 truncate text-sm text-slate-500">{grade.subjectName}</div>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-600">{grade.score}</div>
                    <div className="hidden text-right text-sm font-medium text-slate-500 sm:block">{grade.dateLabel}</div>
                    <ChevronRight className="hidden size-5 text-slate-400 sm:block" />
                    </button>
                ))} */}
                </div>
            </section>

            <footer className="pb-2 pt-8 text-center text-xs font-medium text-slate-400">© 2026 ClaroEd. All rights reserved.</footer>
            </div>
    );
}