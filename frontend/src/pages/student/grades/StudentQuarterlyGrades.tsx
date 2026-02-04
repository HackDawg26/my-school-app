'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Award } from 'lucide-react';

interface QuarterlyGrade {
  id: number;
  subject_name: string;
  quarter: string;
  written_work_score: number;
  written_work_total: number;
  performance_task_score: number;
  performance_task_total: number;
  quarterly_assessment_score: number;
  quarterly_assessment_total: number;
  ww_weight: number;
  pt_weight: number;
  qa_weight: number;
  final_grade: number;
  remarks: string;
}

export default function StudentQuarterlyGrades() {
  const [grades, setGrades] = useState<QuarterlyGrade[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuarter]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get(
        `http://127.0.0.1:8000/api/quarterly-grades/?quarter=${selectedQuarter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching quarterly grades:', error);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-emerald-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 75) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getPerformanceLevel = (grade: number) => {
    if (grade >= 90) return { label: 'Outstanding', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
    if (grade >= 85) return { label: 'Very Satisfactory', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' };
    if (grade >= 80) return { label: 'Satisfactory', color: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' };
    if (grade >= 75) return { label: 'Fairly Satisfactory', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
    return { label: 'Did Not Meet', color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' };
  };

  const calculatePercentage = (score: number, total: number) => {
    return total > 0 ? ((score / total) * 100).toFixed(1) : '0.0';
  };

  const calculateAverage = () => {
    if (grades.length === 0) return '0.00';
    const sum = grades.reduce((acc, grade) => acc + grade.final_grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Quarterly Grades</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600">View your grades by quarter and subject</p>
        </div>

        {/* Quarter Selector (mobile-ready) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Select quarter</label>

            {/* Mobile: full-width segmented buttons */}
            <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={[
                    'py-2.5 rounded-xl p-5 text-sm font-black transition',
                    selectedQuarter === q
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Average (stack on mobile) */}
        {grades.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm p-5 sm:p-6 mb-5 sm:mb-6 text-white overflow-hidden">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm opacity-90 font-bold uppercase tracking-wider">
                  Overall Average ({selectedQuarter})
                </p>
                <p className="mt-1 text-4xl sm:text-5xl font-black tracking-tight">{calculateAverage()}%</p>
              </div>

              {/* hide huge icon on very small screens */}
              <Award size={56} className="opacity-80 hidden xs:block sm:block" />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-slate-600 font-semibold">Loading grades…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && grades.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center">
            <BookOpen size={44} className="mx-auto text-amber-600 mb-3" />
            <p className="text-amber-900 font-black">No grades available for {selectedQuarter}</p>
            <p className="text-amber-800 text-sm mt-1">Grades will appear here once your teacher posts them.</p>
          </div>
        )}

        {/* Grades List */}
        {!loading && grades.length > 0 && (
          <div className="space-y-4">
            {grades.map((grade) => {
              const performance = getPerformanceLevel(grade.final_grade);

              return (
                <div key={grade.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
                  {/* Subject Header (stacks on mobile) */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                        {grade.subject_name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black mt-2 ${performance.color}`}>
                        {performance.label}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Final Grade</p>
                      <p className={`text-3xl sm:text-4xl font-black ${getGradeColor(grade.final_grade)}`}>
                        {grade.final_grade.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown (1 col on phone, 3 on desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-black text-blue-900">Written Work</p>
                        <span className="text-xs font-black text-blue-700">{(grade.ww_weight * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-2xl font-black text-blue-700">
                        {calculatePercentage(grade.written_work_score, grade.written_work_total)}%
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {grade.written_work_score} / {grade.written_work_total} points
                      </p>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-black text-emerald-900">Performance Task</p>
                        <span className="text-xs font-black text-emerald-700">{(grade.pt_weight * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-700">
                        {calculatePercentage(grade.performance_task_score, grade.performance_task_total)}%
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {grade.performance_task_score} / {grade.performance_task_total} points
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-black text-purple-900">Quarterly Exam</p>
                        <span className="text-xs font-black text-purple-700">{(grade.qa_weight * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-2xl font-black text-purple-700">
                        {calculatePercentage(grade.quarterly_assessment_score, grade.quarterly_assessment_total)}%
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {grade.quarterly_assessment_score} / {grade.quarterly_assessment_total} points
                      </p>
                    </div>
                  </div>

                  {/* Remarks */}
                  {grade.remarks && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                        Teacher&apos;s Remarks
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">{grade.remarks}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend (2 cols on phone, 5 cols on md+) */}
        <div className="mt-6 sm:mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Grading Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-slate-700">
            <div>
              <span className="font-black">90–100:</span> Outstanding
            </div>
            <div>
              <span className="font-black">85–89:</span> Very Satisfactory
            </div>
            <div>
              <span className="font-black">80–84:</span> Satisfactory
            </div>
            <div>
              <span className="font-black">75–79:</span> Fairly Satisfactory
            </div>
            <div>
              <span className="font-black">Below 75:</span> Did Not Meet
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
