import { useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useTeacherSubjects,
} from "../../../hooks/useTeacherSubjects";

function prettyGrade(g?: string) {
  return g
    ? g.replaceAll("_", " ")
    : "—";
}

export default function SemesterGradesPage() {
  const navigate = useNavigate();

  const [q, setQ] =
    useState("");

  const {
    data: subjects = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTeacherSubjects();

  const filteredSubjects =
    useMemo(() => {
      const needle =
        q
          .trim()
          .toLowerCase();

      if (!needle) {
        return subjects;
      }

      return subjects.filter(
        (subject) => {
          const haystack = `
            ${subject.name}
            ${prettyGrade(
              subject.grade
            )}
            ${subject.section ?? ""}
            ${
              subject.room_number ??
              ""
            }
          `.toLowerCase();

          return haystack.includes(
            needle
          );
        }
      );
    }, [subjects, q]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl px-3 sm:px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Semester Grades
              Management
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Select a subject
              to manage student
              grades by semester.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            {isFetching
              ? "Refreshing"
              : "Refresh"}
          </button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              value={q}
              onChange={(e) =>
                setQ(
                  e.target.value
                )
              }
              placeholder="Search subjects, grade level, section, or room..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Subject List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-40 rounded-3xl border border-slate-200 bg-white animate-pulse"
                  />
                )
              )}
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
              <div className="font-black text-rose-800">
                Unable to load
                subjects.
              </div>

              <p className="mt-1 text-sm text-rose-600">
                {error instanceof
                Error
                  ? error.message
                  : "Something went wrong."}
              </p>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="mt-4 text-sm font-black text-rose-700 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredSubjects.length ===
            0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
              {subjects.length ===
              0
                ? "No subjects assigned."
                : "No subjects match your search."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredSubjects.map(
                (subject) => (
                  <button
                    key={
                      subject.id
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        `/teacher/grades/semester/${subject.id}`,
                        {
                          state: {
                            subjectName:
                              subject.name,
                          },
                        }
                      )
                    }
                    className="group w-full text-left rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                        <BookOpen
                          size={18}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-black text-slate-900 truncate">
                              {
                                subject.name
                              }
                            </h3>

                            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                              {prettyGrade(
                                subject.grade
                              )}{" "}
                              • Section{" "}
                              {subject.section ??
                                "—"}
                            </p>

                            {subject.room_number ? (
                              <p className="mt-1 text-xs text-slate-500">
                                Room{" "}
                                {
                                  subject.room_number
                                }
                              </p>
                            ) : null}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Average
                            </div>

                            <div className="mt-1 text-lg font-black text-indigo-600">
                              {typeof subject.average ===
                              "number"
                                ? subject.average.toFixed(
                                    2
                                  )
                                : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">
                            {typeof subject.students ===
                            "number" ? (
                              <span className="font-bold text-slate-700">
                                {
                                  subject.students
                                }
                              </span>
                            ) : (
                              "—"
                            )}{" "}
                            students

                            {typeof subject.pendingTasks ===
                            "number" ? (
                              <>
                                {" "}
                                •{" "}
                                <span className="font-bold text-slate-700">
                                  {
                                    subject.pendingTasks
                                  }
                                </span>{" "}
                                pending
                              </>
                            ) : null}
                          </div>

                          <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-indigo-600">
                            Manage

                            <ChevronRight
                              size={16}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 mb-3">
            About Semester Grades
          </h3>

          <ul className="text-sm text-indigo-900/90 space-y-2">
            <li>
              • Activities,
              quizzes, exams,
              performance tasks,
              and manually entered
              classroom work can
              contribute to the
              semester grade.
            </li>

            <li>
              • Student scores are
              organized according
              to the selected
              semester.
            </li>

            <li>
              • Teachers can review
              individual scores
              before finalizing a
              semester grade.
            </li>

            <li>
              • Semester averages
              will eventually be
              calculated from the
              configured grading
              components.
            </li>

            <li>
              • ClaroEd currently
              supports Semester 1,
              Semester 2, and
              Semester 3.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}