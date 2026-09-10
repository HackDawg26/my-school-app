import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Save,
  Trash2,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import type {
  Semester,
  SemesterGrade,
  SaveSemesterGradePayload,
} from "../../../types/teacherTypes";

import {
  useSemesterGrades,
  useSaveSemesterGrade,
  useDeleteSemesterGrade,
  useApplySemesterWeights,
  useTeacherSubject,
} from "../../../hooks/useTeacherSubjects";

const SEMESTER_OPTIONS: {
  label: string;
  value: Semester;
}[] = [
  {
    label: "1st Semester",
    value: "SEMESTER_1",
  },
  {
    label: "2nd Semester",
    value: "SEMESTER_2",
  },
  {
    label: "3rd Semester",
    value: "SEMESTER_3",
  },
];

type WeightForm = {
  ww_weight: number;
  pt_weight: number;
  sa_weight: number;
};

function decimalToPercent(
  value?: number
) {
  return Math.round(
    Number(value ?? 0) *
      100
  );
}

function percentToDecimal(
  value: number
) {
  return value / 100;
}

export default function SubjectSemesterGrades() {
  const navigate =
    useNavigate();

  const { id } =
    useParams<{
      id: string;
    }>();

  const subjectId =
    Number(id || 0);

  const [
    currentSemester,
    setCurrentSemester,
  ] =
    useState<Semester>(
      "SEMESTER_1"
    );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    showWeightModal,
    setShowWeightModal,
  ] = useState(false);

  /*
   * Subject information
   */
  const {
    data: subject,
    isLoading:
      subjectLoading,
  } =
    useTeacherSubject(
      subjectId
    );

  /*
   * Semester grades
   */
  const {
    data: grades = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } =
    useSemesterGrades(
      subjectId,
      currentSemester
    );

  /*
   * Mutations
   */
  const saveMutation =
    useSaveSemesterGrade();

  const deleteMutation =
    useDeleteSemesterGrade();

  const applyWeightsMutation =
    useApplySemesterWeights();

  /*
   * Local row drafts
   *
   * React Query owns the actual
   * server grades.
   *
   * This object only contains
   * unsaved edits.
   */
  const [
    draftGrades,
    setDraftGrades,
  ] = useState<
    Record<
      number,
      Partial<SemesterGrade>
    >
  >({});

  /*
   * Determine the currently
   * applied backend weights.
   *
   * Backend:
   * 0.40 / 0.40 / 0.20
   *
   * UI:
   * 40 / 40 / 20
   */
  const defaultWeights =
    useMemo<WeightForm>(
      () => {
        const grade =
          grades[0];

        return {
          ww_weight:
            grade
              ? decimalToPercent(
                  grade.ww_weight
                )
              : 40,

          pt_weight:
            grade
              ? decimalToPercent(
                  grade.pt_weight
                )
              : 40,

          sa_weight:
            grade
              ? decimalToPercent(
                  grade.sa_weight
                )
              : 20,
        };
      },
      [grades]
    );

  const [
    weights,
    setWeights,
  ] =
    useState<WeightForm>({
      ww_weight: 40,
      pt_weight: 40,
      sa_weight: 20,
    });

  /*
   * Load new weights whenever
   * semester data changes.
   */
  useEffect(() => {
    setWeights(
      defaultWeights
    );

    setDraftGrades({});
  }, [
    defaultWeights,
    currentSemester,
  ]);

  /*
   * Invalid route protection.
   */
  useEffect(() => {
    if (
      !Number.isFinite(
        subjectId
      ) ||
      subjectId <= 0
    ) {
      navigate(
        "/teacher/grades/semester",
        {
          replace: true,
        }
      );
    }
  }, [
    subjectId,
    navigate,
  ]);

  /*
   * Draft number input
   */
  function handleInputChange(
    studentId: number,
    field:
      keyof SemesterGrade,
    raw: string
  ) {
    setDraftGrades(
      (previous) => ({
        ...previous,

        [studentId]: {
          ...previous[
            studentId
          ],

          [field]:
            raw === ""
              ? null
              : Number(
                  raw
                ),
        },
      })
    );
  }

  /*
   * Draft remarks
   */
  function handleRemarksChange(
    studentId: number,
    remarks: string
  ) {
    setDraftGrades(
      (previous) => ({
        ...previous,

        [studentId]: {
          ...previous[
            studentId
          ],
          remarks,
        },
      })
    );
  }

  /*
   * Save one grade row
   */
  async function handleSaveRow(
    row: SemesterGrade
  ) {
    const draft =
      draftGrades[
        row.student
      ] || {};

    const payload: SaveSemesterGradePayload =
      {
        gradeId:
          row.id,

        student:
          row.student,

        SubjectOffering:
          subjectId,

        semester:
          currentSemester,

        written_work_score:
          draft.written_work_score !==
          undefined
            ? draft.written_work_score
            : row.written_work_score,

        written_work_total:
          draft.written_work_total !==
          undefined
            ? Number(
                draft.written_work_total
              )
            : row.written_work_total,

        performance_task_score:
          draft.performance_task_score !==
          undefined
            ? draft.performance_task_score
            : row.performance_task_score,

        performance_task_total:
          draft.performance_task_total !==
          undefined
            ? Number(
                draft.performance_task_total
              )
            : row.performance_task_total,

        semester_assessment_score:
          draft.semester_assessment_score !==
          undefined
            ? draft.semester_assessment_score
            : row.semester_assessment_score,

        semester_assessment_total:
          draft.semester_assessment_total !==
          undefined
            ? Number(
                draft.semester_assessment_total
              )
            : row.semester_assessment_total,

        /*
         * Keep backend values
         * as decimal weights.
         */
        ww_weight:
          row.ww_weight,

        pt_weight:
          row.pt_weight,

        sa_weight:
          row.sa_weight,

        remarks:
          draft.remarks !==
          undefined
            ? draft.remarks
            : row.remarks ||
              "",
      };

    try {
      await saveMutation.mutateAsync(
        payload
      );

      setDraftGrades(
        (previous) => {
          const next = {
            ...previous,
          };

          delete next[
            row.student
          ];

          return next;
        }
      );
    } catch (error) {
      console.error(
        "Failed to save row:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save grade."
      );
    }
  }

  /*
   * Delete grade
   */
  async function handleDeleteRow(
    gradeId?: number
  ) {
    if (!gradeId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this semester grade?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(
        {
          subjectId,

          semester:
            currentSemester,

          gradeId,
        }
      );
    } catch (error) {
      console.error(
        "Failed to delete grade:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete grade."
      );
    }
  }

  /*
   * Apply weights
   */
  async function handleSaveWeights() {
    const total =
      weights.ww_weight +
      weights.pt_weight +
      weights.sa_weight;

    if (total !== 100) {
      alert(
        "Weights must total 100%."
      );

      return;
    }

    try {
      await applyWeightsMutation.mutateAsync(
        {
          subjectId,

          semester:
            currentSemester,

          /*
           * Convert UI percentage
           * back to backend decimal.
           */
          ww_weight:
            percentToDecimal(
              weights.ww_weight
            ),

          pt_weight:
            percentToDecimal(
              weights.pt_weight
            ),

          sa_weight:
            percentToDecimal(
              weights.sa_weight
            ),
        }
      );

      setShowWeightModal(
        false
      );
    } catch (error) {
      console.error(
        "Failed to apply weights:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to apply weights."
      );
    }
  }

  /*
   * Search
   */
  const filteredGrades =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return grades;
      }

      return grades.filter(
        (grade) => {
          const name =
            grade.student_name
              ?.toLowerCase() ||
            "";

          const code =
            grade.student_id
              ?.toLowerCase() ||
            "";

          return (
            name.includes(
              query
            ) ||
            code.includes(
              query
            )
          );
        }
      );
    }, [
      grades,
      searchQuery,
    ]);

  const totalWeight =
    weights.ww_weight +
    weights.pt_weight +
    weights.sa_weight;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex flex-col space-y-6 p-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/teacher/grades/semester"
                )
              }
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Return to Subjects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                {subjectLoading
                  ? "Loading subject..."
                  : subject?.name ||
                    "Subject Grading Sheet"}
              </h1>

              <p className="text-xs text-slate-500">
                Manage student
                scores, semester
                weights, and
                remarks
              </p>

            </div>

          </div>

          {/* Semester tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">

            {SEMESTER_OPTIONS.map(
              (item) => (

                <button
                  key={
                    item.value
                  }
                  type="button"
                  onClick={() =>
                    setCurrentSemester(
                      item.value
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    currentSemester ===
                    item.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {
                    item.label
                  }
                </button>

              )
            )}

          </div>

        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="relative w-full sm:w-72">

            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

            <input
              type="text"
              placeholder="Search student or ID..."
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />

          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              disabled={
                isFetching
              }
              className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setShowWeightModal(
                  true
                )
              }
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />

              <span>
                Grading Weights
              </span>
            </button>

          </div>

        </div>

        {/* Grade table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">

          {isLoading ? (

            <div className="p-12 text-center text-slate-400 text-sm">
              Loading student
              records...
            </div>

          ) : isError ? (

            <div className="p-12 text-center text-rose-500 text-sm">

              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />

                <span>
                  Failed to load
                  semester grades.
                </span>
              </div>

              {error instanceof
                Error && (
                <p className="mt-2 text-xs">
                  {
                    error.message
                  }
                </p>
              )}

            </div>

          ) : filteredGrades.length ===
            0 ? (

            <div className="p-12 text-center text-slate-400 text-sm">
              No records found
              for this semester.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm border-collapse">

                <thead>

                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600">

                    <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10 min-w-56">
                      Student
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Written Work (
                      {
                        defaultWeights.ww_weight
                      }
                      %)
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Performance Task (
                      {
                        defaultWeights.pt_weight
                      }
                      %)
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Semester Assessment (
                      {
                        defaultWeights.sa_weight
                      }
                      %)
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Final Grade
                    </th>

                    <th className="py-3.5 px-4">
                      Remarks
                    </th>

                    <th className="py-3.5 px-4 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredGrades.map(
                    (row) => {

                      const draft =
                        draftGrades[
                          row.student
                        ] || {};

                      const isModified =
                        Object.keys(
                          draft
                        ).length >
                        0;

                      const isSavingThisRow =
                        saveMutation.isPending &&
                        saveMutation.variables
                          ?.student ===
                          row.student;

                      const isDeletingThisRow =
                        deleteMutation.isPending &&
                        deleteMutation.variables
                          ?.gradeId ===
                          row.id;

                      return (

                        <tr
                          key={
                            row.id ??
                            row.student
                          }
                          className="hover:bg-slate-50/50"
                        >

                          <td className="py-3 px-4 sticky left-0 bg-white z-10">

                            <div className="font-medium text-slate-900">
                              {row.student_name ||
                                `Student #${row.student}`}
                            </div>

                            <div className="text-xs text-slate-400">
                              {row.student_id ||
                                "—"}
                            </div>

                          </td>

                          {/* WW */}
                          <td className="py-3 px-4">

                            <ScorePair
                              score={
                                draft.written_work_score ??
                                row.written_work_score
                              }
                              total={
                                draft.written_work_total ??
                                row.written_work_total
                              }
                              onScore={(
                                value
                              ) =>
                                handleInputChange(
                                  row.student,
                                  "written_work_score",
                                  value
                                )
                              }
                              onTotal={(
                                value
                              ) =>
                                handleInputChange(
                                  row.student,
                                  "written_work_total",
                                  value
                                )
                              }
                            />

                          </td>

                          {/* PT */}
                          <td className="py-3 px-4">

                            <ScorePair
                              score={
                                draft.performance_task_score ??
                                row.performance_task_score
                              }
                              total={
                                draft.performance_task_total ??
                                row.performance_task_total
                              }
                              onScore={(
                                value
                              ) =>
                                handleInputChange(
                                  row.student,
                                  "performance_task_score",
                                  value
                                )
                              }
                              onTotal={(
                                value
                              ) =>
                                handleInputChange(
                                  row.student,
                                  "performance_task_total",
                                  value
                                )
                              }
                            />

                          </td>

                          {/* Semester assessment */}
                          <td className="py-3 px-4">

                            <ScorePair
                              score={
                                draft.semester_assessment_score ??
                                row.semester_assessment_score
                              }
                              total={
                                draft.semester_assessment_total ??
                                row.semester_assessment_total
                              }
                              onScore={(
                                value
                              ) =>
                                handleInputChange(
                                  row.student,
                                  "semester_assessment_score",
                                  value
                                )
                              }
                              onTotal={(
                                value
                              ) =>
                                handleInputChange(
                                  row.student,
                                  "semester_assessment_total",
                                  value
                                )
                              }
                            />

                          </td>

                          {/* Final */}
                          <td className="py-3 px-4 text-center">

                            <span
                              className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                                (row.final_grade ??
                                  0) >=
                                75
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : row.final_grade !==
                                    undefined &&
                                    row.final_grade !==
                                      null
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {row.final_grade !==
                                undefined &&
                              row.final_grade !==
                                null
                                ? Number(
                                    row.final_grade
                                  ).toFixed(
                                    2
                                  )
                                : "—"}
                            </span>

                          </td>

                          {/* Remarks */}
                          <td className="py-3 px-4">

                            <input
                              type="text"
                              value={
                                draft.remarks !==
                                undefined
                                  ? draft.remarks
                                  : row.remarks ||
                                    ""
                              }
                              onChange={(
                                event
                              ) =>
                                handleRemarksChange(
                                  row.student,
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Add remark..."
                              className="w-full min-w-36 px-2 py-1 text-xs bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:border-indigo-500"
                            />

                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">

                            <div className="flex items-center justify-end gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveRow(
                                    row
                                  )
                                }
                                disabled={
                                  !isModified ||
                                  isSavingThisRow
                                }
                                className={`p-1.5 rounded-md ${
                                  isModified
                                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                    : "text-slate-300 cursor-not-allowed"
                                }`}
                              >
                                <Save className="w-4 h-4" />
                              </button>

                              {row.id && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteRow(
                                      row.id
                                    )
                                  }
                                  disabled={
                                    isDeletingThisRow
                                  }
                                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* Weight modal */}
      {showWeightModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-sm p-6 space-y-4">

            <h2 className="text-base font-bold text-slate-900">
              Adjust Component
              Weights
            </h2>

            <WeightField
              label="Written Work (%)"
              value={
                weights.ww_weight
              }
              onChange={(
                value
              ) =>
                setWeights(
                  (
                    previous
                  ) => ({
                    ...previous,

                    ww_weight:
                      value,
                  })
                )
              }
            />

            <WeightField
              label="Performance Task (%)"
              value={
                weights.pt_weight
              }
              onChange={(
                value
              ) =>
                setWeights(
                  (
                    previous
                  ) => ({
                    ...previous,

                    pt_weight:
                      value,
                  })
                )
              }
            />

            <WeightField
              label="Semester Assessment (%)"
              value={
                weights.sa_weight
              }
              onChange={(
                value
              ) =>
                setWeights(
                  (
                    previous
                  ) => ({
                    ...previous,

                    sa_weight:
                      value,
                  })
                )
              }
            />

            <div className="text-xs text-slate-500">

              Total:{" "}

              <span
                className={
                  totalWeight ===
                  100
                    ? "text-emerald-600 font-semibold"
                    : "text-rose-600 font-semibold"
                }
              >
                {
                  totalWeight
                }
                %
              </span>

            </div>

            <div className="flex justify-end gap-2 pt-2">

              <button
                type="button"
                onClick={() =>
                  setShowWeightModal(
                    false
                  )
                }
                disabled={
                  applyWeightsMutation.isPending
                }
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveWeights
                }
                disabled={
                  totalWeight !==
                    100 ||
                  applyWeightsMutation.isPending
                }
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {applyWeightsMutation.isPending
                  ? "Applying..."
                  : "Apply Weights"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

function ScorePair({
  score,
  total,
  onScore,
  onTotal,
}: {
  score:
    number | null;

  total:
    number | null;

  onScore:
    (
      value: string
    ) => void;

  onTotal:
    (
      value: string
    ) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">

      <input
        type="number"
        min={0}
        step="0.01"
        value={
          score ?? ""
        }
        onChange={(
          event
        ) =>
          onScore(
            event.target.value
          )
        }
        className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded text-xs"
      />

      <span className="text-slate-400">
        /
      </span>

      <input
        type="number"
        min={1}
        step="0.01"
        value={
          total ?? ""
        }
        onChange={(
          event
        ) =>
          onTotal(
            event.target.value
          )
        }
        className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded text-xs"
      />

    </div>
  );
}

function WeightField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;

  onChange:
    (
      value: number
    ) => void;
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
      </label>

      <input
        type="number"
        min={0}
        max={100}
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            Number(
              event.target
                .value
            )
          )
        }
        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
      />

    </div>
  );
}