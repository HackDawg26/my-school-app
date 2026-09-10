import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Download,
  RefreshCw,
  Users,
  ClipboardList,
  BookOpen,
  Layers,
  AlertCircle,
} from "lucide-react";

import {
  useTeacherSubmissionsSummary,
} from "../../../hooks/useTeacherSubjects";

import type {
  SubmissionSubjectRow,
} from "../../../types/teacherTypes";

type ViewType =
  | "BY_SUBJECT"
  | "TOTALS";

function safePct(
  numerator: number,
  denominator: number
) {
  if (
    !denominator ||
    denominator <= 0
  ) {
    return 0;
  }

  return Math.round(
    (numerator /
      denominator) *
      100
  );
}

function escapeCsvValue(
  value: unknown
) {
  const stringValue =
    String(value ?? "");

  if (
    stringValue.includes(
      ","
    ) ||
    stringValue.includes(
      '"'
    ) ||
    stringValue.includes(
      "\n"
    )
  ) {
    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  }

  return stringValue;
}

function downloadCsv(
  filename: string,
  csv: string
) {
  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

  const url =
    window.URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href =
    url;

  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  window.URL.revokeObjectURL(
    url
  );
}

export default function TeacherSubmissionsPage() {
  const [
    view,
    setView,
  ] =
    useState<ViewType>(
      "BY_SUBJECT"
    );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } =
    useTeacherSubmissionsSummary();

  const totals =
    data?.totals ??
    null;

  const rows =
    data?.by_subject ??
    [];

  /*
   * Derived subject rows.
   *
   * We intentionally calculate
   * submission percentage using:
   *
   * unique students / enrolled students
   *
   * rather than relying on the
   * backend's submission_rate.
   */
  const subjectRows =
    useMemo(() => {
      return rows.map(
        (
          row
        ) => {
          const attempted =
            row.unique_students ??
            0;

          const total =
            row.total_students ??
            0;

          return {
            ...row,

            attempted,

            total,

            percentage:
              safePct(
                attempted,
                total
              ),
          };
        }
      );
    }, [
      rows,
    ]);

  function downloadSubjectTotalsCsv() {
    const headers = [
      "subject_offering_id",
      "subject",
      "attempted_students",
      "total_students",
      "submission_rate_pct",
      "submitted_attempts",
    ];

    const lines =
      subjectRows.map(
        (
          row
        ) => {
          const values = [
            row.subject_offering_id,
            row.subject,
            row.attempted,
            row.total,
            row.percentage,
            row.submitted_attempts ??
              0,
          ];

          return values
            .map(
              escapeCsvValue
            )
            .join(",");
        }
      );

    const csv = [
      headers.join(
        ","
      ),
      ...lines,
    ].join("\n");

    downloadCsv(
      "submissions_by_subject_totals.csv",
      csv
    );
  }

  function downloadOverallTotalsCsv() {
    if (!totals) {
      return;
    }

    const headers = [
      "overall_attempts",
      "overall_unique_students",
      "overall_quizzes",
      "overall_subject_offerings",
    ];

    const values = [
      totals.overall_attempts,
      totals.overall_unique_students,
      totals.overall_quizzes,
      totals.overall_subject_offerings,
    ];

    const csv = [
      headers.join(
        ","
      ),

      values
        .map(
          escapeCsvValue
        )
        .join(","),
    ].join("\n");

    downloadCsv(
      "submissions_overall_totals.csv",
      csv
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full px-4 md:px-6 py-6 md:py-10 space-y-6">

        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

          <div>

            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Teacher
            </div>

            <h1 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Submissions
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Review quiz
              participation,
              student attempts,
              and submission
              activity by subject.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              disabled={
                isFetching
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={
                  16
                }
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                downloadSubjectTotalsCsv
              }
              disabled={
                subjectRows.length ===
                0
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download
                size={
                  16
                }
              />

              Subject CSV
            </button>

            <button
              type="button"
              onClick={
                downloadOverallTotalsCsv
              }
              disabled={
                !totals
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download
                size={
                  16
                }
              />

              Overall CSV
            </button>

          </div>

        </div>

        {/* View Toggle */}

        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">

          <button
            type="button"
            onClick={() =>
              setView(
                "BY_SUBJECT"
              )
            }
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${
              view ===
              "BY_SUBJECT"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            By Subject
          </button>

          <button
            type="button"
            onClick={() =>
              setView(
                "TOTALS"
              )
            }
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${
              view ===
              "TOTALS"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Overall Totals
          </button>

        </div>

        {/* Loading */}

        {isLoading ? (

          <LoadingState />

        ) : isError ? (

          <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center">

            <AlertCircle
              size={
                28
              }
              className="mx-auto text-rose-500"
            />

            <div className="mt-3 font-black text-slate-900">
              Failed to load
              submissions.
            </div>

            <div className="mt-1 text-sm text-slate-500">
              {error instanceof
              Error
                ? error.message
                : "Something went wrong."}
            </div>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-indigo-600"
            >
              Try Again
            </button>

          </div>

        ) : (

          <>
            {/* Totals */}

            {view ===
              "TOTALS" && (
              <OverallTotals
                totals={
                  totals
                }
              />
            )}

            {/* Subjects */}

            {view ===
              "BY_SUBJECT" && (
              <SubjectSubmissionList
                rows={
                  subjectRows
                }
              />
            )}

          </>
        )}

      </section>
    </main>
  );
}

/* ==============================
   Overall Totals
============================== */

function OverallTotals({
  totals,
}: {
  totals:
    | {
        overall_attempts:
          number;

        overall_unique_students:
          number;

        overall_quizzes:
          number;

        overall_subject_offerings:
          number;
      }
    | null;
}) {
  if (!totals) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No overall
        submission data
        available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      <StatCard
        icon={
          <ClipboardList
            size={
              20
            }
          />
        }
        title="Overall Attempts"
        value={
          totals.overall_attempts
        }
        hint="Submitted quiz attempts"
      />

      <StatCard
        icon={
          <Users
            size={
              20
            }
          />
        }
        title="Unique Students"
        value={
          totals.overall_unique_students
        }
        hint="Students who participated"
      />

      <StatCard
        icon={
          <BookOpen
            size={
              20
            }
          />
        }
        title="Total Quizzes"
        value={
          totals.overall_quizzes
        }
        hint="Quizzes with activity"
      />

      <StatCard
        icon={
          <Layers
            size={
              20
            }
          />
        }
        title="Subject Offerings"
        value={
          totals.overall_subject_offerings
        }
        hint="Subjects represented"
      />

    </div>
  );
}

/* ==============================
   Subject List
============================== */

type DisplaySubjectRow =
  SubmissionSubjectRow & {
    attempted: number;
    total: number;
    percentage: number;
  };

function SubjectSubmissionList({
  rows,
}: {
  rows:
    DisplaySubjectRow[];
}) {
  if (
    rows.length ===
    0
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No submission data
        yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      <div className="border-b border-slate-100 px-6 py-5">

        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Subject Overview
        </div>

        <h2 className="mt-1 text-lg font-black text-slate-900">
          Student
          Participation
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Participation is
          calculated using
          unique students who
          attempted at least
          once.
        </p>

      </div>

      <div className="divide-y divide-slate-100">

        {rows.map(
          (
            row
          ) => (

          <div
            key={
              row.subject_offering_id
            }
            className="p-5 md:p-6"
          >

            <div className="flex flex-col md:flex-row md:items-center gap-5">

              {/* Subject info */}

              <div className="md:w-80 min-w-0">

                <div className="font-black text-slate-900 truncate">
                  {
                    row.subject
                  }
                </div>

                <div className="mt-1 text-xs text-slate-500">

                  Attempted{" "}

                  <span className="font-black text-slate-700">
                    {
                      row.attempted
                    }
                  </span>

                  /

                  <span className="font-black text-slate-700">
                    {
                      row.total
                    }
                  </span>

                  {" "}•{" "}

                  <span className="font-black text-indigo-600">
                    {
                      row.percentage
                    }
                    %
                  </span>

                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {
                    row.submitted_attempts ??
                    0
                  }{" "}
                  total attempt
                  {row.submitted_attempts ===
                  1
                    ? ""
                    : "s"}
                </div>

                <Link
                  to={`/teacher/submissions/${row.subject_offering_id}`}
                  className="mt-3 inline-flex text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  View per quiz →
                </Link>

              </div>

              {/* Progress */}

              <div className="flex-1">

                <div className="flex justify-between mb-2">

                  <span className="text-xs font-bold text-slate-500">
                    Participation
                  </span>

                  <span className="text-xs font-black text-slate-700">
                    {
                      row.percentage
                    }
                    %
                  </span>

                </div>

                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">

                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          row.percentage
                        )
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          )
        )}

      </div>

    </div>
  );
}

/* ==============================
   Stat Card
============================== */

function StatCard({
  icon,
  title,
  value,
  hint,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  value:
    number | string;

  hint:
    string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            {title}
          </div>

          <div className="mt-3 text-3xl font-black text-slate-900">
            {
              value
            }
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {
              hint
            }
          </div>

        </div>

        <div className="h-11 w-11 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
          {
            icon
          }
        </div>

      </div>

    </div>
  );
}

/* ==============================
   Loading
============================== */

function LoadingState() {
  return (
    <div className="space-y-4">

      {Array.from({
        length: 4,
      }).map(
        (
          _,
          index
        ) => (

        <div
          key={
            index
          }
          className="h-28 rounded-3xl border border-slate-200 bg-white animate-pulse"
        />

        )
      )}

    </div>
  );
}