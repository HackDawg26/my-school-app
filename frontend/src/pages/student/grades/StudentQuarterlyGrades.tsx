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
  }, [selectedQuarter]);

  const fetchGrades = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      const response = await axios.get(
        `http://127.0.0.1:8000/api/quarterly-grades/?quarter=${selectedQuarter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching quarterly grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (grade: number) => {
    if (grade >= 90) return { label: 'Outstanding', color: 'bg-green-100 text-green-800' };
    if (grade >= 85) return { label: 'Very Satisfactory', color: 'bg-blue-100 text-blue-800' };
    if (grade >= 80) return { label: 'Satisfactory', color: 'bg-cyan-100 text-cyan-800' };
    if (grade >= 75) return { label: 'Fairly Satisfactory', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Did Not Meet Expectations', color: 'bg-red-100 text-red-800' };
  };

  const calculatePercentage = (score: number, total: number) => {
    return total > 0 ? ((score / total) * 100).toFixed(1) : '0.0';
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.final_grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quarterly Grades</h1>
        <p className="text-gray-600">View your grades by quarter and subject</p>
      </div>

      {/* Quarter Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-semibold">Select Quarter:</label>
          <div className="flex gap-2">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedQuarter === q
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Average */}
      {grades.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overall Average ({selectedQuarter})</p>
              <p className="text-4xl font-bold">{calculateAverage()}%</p>
            </div>
            <Award size={64} className="opacity-80" />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading grades...</p>
        </div>
      )}

      {/* No Grades Message */}
      {!loading && grades.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <BookOpen size={48} className="mx-auto text-yellow-600 mb-3" />
          <p className="text-yellow-800 font-medium">No grades available for {selectedQuarter}</p>
          <p className="text-yellow-700 text-sm mt-1">Grades will appear here once your teacher posts them.</p>
        </div>
      )}

      {/* Grades List */}
      {!loading && grades.length > 0 && (
        <div className="space-y-4">
          {grades.map((grade) => {
            const performance = getPerformanceLevel(grade.final_grade);
            return (
              <div key={grade.id} className="bg-white rounded-lg shadow p-6">
                {/* Subject Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{grade.subject_name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${performance.color}`}>
                      {performance.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Final Grade</p>
                    <p className={`text-4xl font-bold ${getGradeColor(grade.final_grade)}`}>
                      {grade.final_grade.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Written Work */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-blue-800">Written Work</p>
                      <span className="text-xs text-blue-600">
                        {(grade.ww_weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {calculatePercentage(grade.written_work_score, grade.written_work_total)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {grade.written_work_score} / {grade.written_work_total} points
                    </p>
                  </div>

                  {/* Performance Task */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-green-800">Performance Task</p>
                      <span className="text-xs text-green-600">
                        {(grade.pt_weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {calculatePercentage(grade.performance_task_score, grade.performance_task_total)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {grade.performance_task_score} / {grade.performance_task_total} points
                    </p>
                  </div>

                  {/* Quarterly Assessment */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-purple-800">Quarterly Exam</p>
                      <span className="text-xs text-purple-600">
                        {(grade.qa_weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {calculatePercentage(grade.quarterly_assessment_score, grade.quarterly_assessment_total)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {grade.quarterly_assessment_score} / {grade.quarterly_assessment_total} points
                    </p>
                  </div>
                </div>

                {/* Teacher Remarks */}
                {grade.remarks && (
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Teacher's Remarks:</p>
                    <p className="text-sm text-gray-800">{grade.remarks}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-3">Grading Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <span className="font-semibold">90-100:</span> Outstanding
          </div>
          <div>
            <span className="font-semibold">85-89:</span> Very Satisfactory
          </div>
          <div>
            <span className="font-semibold">80-84:</span> Satisfactory
          </div>
          <div>
            <span className="font-semibold">75-79:</span> Fairly Satisfactory
          </div>
          <div>
            <span className="font-semibold">Below 75:</span> Did Not Meet
          </div>
        </div>
      </div>
    </div>
  );
}
