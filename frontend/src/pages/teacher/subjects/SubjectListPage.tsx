import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  BarChart,
  Plus,
  AlertCircle,
  Trash2,
  Search,
} from "lucide-react";

import {
  useTeacherSubjects,
  useDeleteTeacherSubject,
} from "../../../hooks/useTeacherSubjects";

export default function SubjectListPage() {
  // UI state only
  const [q, setQ] = useState("");

  const [sort, setSort] =
    useState<"name" | "students" | "average">("name");

  // React Query
  const {
    data: offerings = [],
    isLoading,
    isError,
    error,
  } = useTeacherSubjects();

  const deleteSubject = useDeleteTeacherSubject();

  const handleDelete = (id: number) => {
    const ok = window.confirm(
      "Delete this subject offering? This cannot be undone."
    );

    if (!ok) return;

    deleteSubject.mutate(id, {
      onError: (error) => {
        console.error("Delete failed:", error);
        alert("Failed to delete offering.");
      },
    });
  };

  const totalClasses = offerings.length;

  const totalStudents = offerings.reduce(
    (sum, offering) =>
      sum + (offering.students ?? 0),
    0
  );

  const filteredAndSorted = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const filtered = !needle
      ? offerings
      : offerings.filter((o) => {
          const hay = `
            ${o.name ?? ""}
            ${o.grade ?? ""}
            ${o.section ?? ""}
            ${o.room_number ?? ""}
            ${o.nextClass ?? ""}
          `.toLowerCase();

          return hay.includes(needle);
        });

    return [...filtered].sort((a, b) => {
      if (sort === "students") {
        return (b.students ?? 0) - (a.students ?? 0);
      }

      if (sort === "average") {
        return (
          (Number(b.average ?? -1) || -1) -
          (Number(a.average ?? -1) || -1)
        );
      }

      return String(a.name ?? "").localeCompare(
        String(b.name ?? "")
      );
    });
  }, [offerings, q, sort]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading subject offerings…
      </div>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle
              size={24}
              className="mx-auto text-rose-600"
            />

            <h1 className="mt-4 text-xl font-black text-slate-900">
              Unable to load subject offerings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading the subjects."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (offerings.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-indigo-600">
              <BookOpen size={20} />
            </div>

            <h1 className="mt-4 text-xl font-black text-slate-900">
              No subject offerings yet
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create one to start managing your classes.
            </p>

            <Link
              to="/teacher/subject/create-subject"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Create Subject Offering
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Teacher Dashboard
              </div>

              <h1 className="mt-1 text-base sm:text-lg font-black text-slate-900 truncate">
                Subject Offerings
              </h1>

              <p className="text-xs text-slate-500">
                <span className="font-black text-slate-700">
                  {totalClasses}
                </span>{" "}
                offerings •{" "}
                <span className="font-black text-slate-700">
                  {totalStudents}
                </span>{" "}
                students
              </p>
            </div>

            <Link
              to="/teacher/subject/create-subject"
              className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm font-black"
            >
              <Plus size={16} />

              <span className="hidden sm:inline">
                New Offering
              </span>

              <span className="sm:hidden">New</span>
            </Link>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search (e.g., Math, Grade 7, Section A)…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as
                    | "name"
                    | "students"
                    | "average"
                )
              }
              className="w-full sm:w-44 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Sort: Name</option>
              <option value="students">
                Sort: Students
              </option>
              <option value="average">
                Sort: Average
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-4 py-6">
        {filteredAndSorted.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
            No results for{" "}
            <span className="font-black text-slate-900">
              “{q.trim()}”
            </span>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSorted.map((o) => {
              const avg =
                typeof o.average === "number"
                  ? o.average
                  : null;

              const lowAvg =
                avg !== null && avg < 85;

              const isDeleting =
                deleteSubject.isPending &&
                deleteSubject.variables === o.id;

              return (
                <Link
                  key={o.id}
                  to={`/teacher/subject/${o.id}`}
                  className="group w-full text-left rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                          <BookOpen size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-black text-slate-900 truncate">
                            {(o.name ?? "Untitled").toUpperCase()}
                          </h3>

                          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                            {o.grade ?? "—"} • Section{" "}
                            {o.section ?? "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(o.id);
                      }}
                      disabled={isDeleting}
                      className="shrink-0 p-2 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 disabled:opacity-60"
                      title="Delete offering"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Room
                      </div>

                      <div className="mt-1 text-sm font-black text-slate-800 truncate">
                        {o.room_number ?? "—"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Schedule
                      </div>

                      <div className="mt-1 text-sm font-black text-slate-800 truncate">
                        {o.nextClass ?? "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-600 font-bold">
                        <Users size={16} />
                        Students
                      </span>

                      <span className="font-black text-slate-900">
                        {o.students ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-600 font-bold">
                        <BarChart size={16} />
                        Average
                      </span>

                      <span
                        className={`font-black ${
                          lowAvg
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {avg !== null ? `${avg}%` : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-amber-700 font-bold">
                        <AlertCircle size={16} />
                        Pending
                      </span>

                      <span className="font-black text-amber-700">
                        {o.pendingTasks ?? 0}
                      </span>
                    </div>

                    {isDeleting ? (
                      <div className="pt-2 text-xs font-bold text-slate-500">
                        Deleting…
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Open details
                    </span>

                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 group-hover:underline">
                      Manage
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}