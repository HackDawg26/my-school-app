import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useTeacherSubjectGrades,
} from "../../../hooks/useTeacherSubjects";

import type {
  Semester,
} from "../../../types/teacherTypes";

function semesterLabel(
  semester: Semester
) {
  switch (semester) {
    case "SEMESTER_1":
      return "1st Semester";

    case "SEMESTER_2":
      return "2nd Semester";

    case "SEMESTER_3":
      return "3rd Semester";

    default:
      return semester;
  }
}

export default function SubjectGradesTab() {
  const { id } =
    useParams<{ id: string }>();

  const subjectId = Number(id || 0);

  const [selectedSemester, setSelectedSemester] =
    useState<Semester | "ALL">("ALL");

  const {
    data: grades = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTeacherSubjectGrades(subjectId);

  const filteredGrades = useMemo(() => {
    if (selectedSemester === "ALL") {
      return grades;
    }

    return grades.filter(
      (grade) =>
        grade.semester === selectedSemester
    );
  }, [grades, selectedSemester]);

  if (!subjectId) {
    return (
      <div className="p-6 text-rose-600">
        Invalid subject ID.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        Loading grades…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
        <div className="font-bold text-rose-700">
          Failed to load grades.
        </div>

        <p className="mt-1 text-sm text-rose-600">
          {error instanceof Error
            ? error.message
            : "Something went wrong."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-4 text-sm font-bold text-rose-700 hover:underline disabled:opacity-50"
        >
          {isFetching
            ? "Retrying..."
            : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Grades
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            View student grades by semester.
          </p>
        </div>

        {/* Semester Filter */}
        <select
          value={selectedSemester}
          onChange={(e) =>
            setSelectedSemester(
              e.target.value as
                | Semester
                | "ALL"
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">
            All Semesters
          </option>

          <option value="SEMESTER_1">
            1st Semester
          </option>

          <option value="SEMESTER_2">
            2nd Semester
          </option>

          <option value="SEMESTER_3">
            3rd Semester
          </option>
        </select>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredGrades.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No semester grades yet.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="px-5 py-3">
                    Student
                  </th>

                  <th className="px-5 py-3">
                    Semester
                  </th>

                  <th className="px-5 py-3">
                    Written Work
                  </th>

                  <th className="px-5 py-3">
                    Final Grade
                  </th>

                  <th className="px-5 py-3">
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredGrades.map(
                  (grade) => (
                    <tr
                      key={grade.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {
                          grade.student_name
                        }
                      </td>

                      <td className="px-5 py-4">
                        {semesterLabel(
                          grade.semester
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {
                          grade.written_work_score
                        }
                        /
                        {
                          grade.written_work_total
                        }
                      </td>

                      <td className="px-5 py-4 font-black text-slate-900">
                        {grade.final_grade ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        {grade.remarks ??
                          "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}