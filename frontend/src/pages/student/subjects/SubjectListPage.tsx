import {useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronRight,
  GraduationCap,
  User,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Users,
  CalendarDays,
  DoorOpen,
} from "lucide-react";

import { useStudentSubjects } from "../../../hooks/useStudentSubjects";



type FilterKey = "ALL" | "PASSING" | "NEEDS" | "NOGRADE";

function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function badgeMeta(grade: number | null) {
  if (grade === null) {
    return {
      label: "No Grade",
      Icon: MinusCircle,
      pill: "bg-slate-50 text-slate-600 border-slate-200",
      ring: "bg-slate-200",
    };
  }
  if (grade >= 75) {
    return {
      label: "Passing",
      Icon: CheckCircle2,
      pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
      ring: "bg-emerald-500",
    };
  }
  return {
    label: "Needs Attention",
    Icon: AlertTriangle,
    pill: "bg-rose-50 text-rose-700 border-rose-100",
    ring: "bg-rose-500",
  };
}

export default function SubjectsPage() {
  const {
    data: offerings = [],
    isLoading,
    error,
  } = useStudentSubjects();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");


  

  
  const cards = useMemo(() => {
    const normalizedQ = query.trim().toLowerCase();

    const mapped = offerings.map((o) => {
      const grade = typeof o.average === "number" ? Math.round(o.average) : null;
      const progress = clamp(safeNumber(o.progress, 0)); // keep your current meaning
      const meta = badgeMeta(grade);

      const teacher = (o.teacher_name ?? "—").trim();

      return {
        ...o,
        grade,
        progress,
        teacher,
        statusLabel: meta.label,
        statusPill: meta.pill,
        StatusIcon: meta.Icon,
        ringColor: meta.ring,
      };
    });

    const filteredBySearch = normalizedQ
      ? mapped.filter((x) => {
          const hay = `${x.subject_name} ${x.teacher}`.toLowerCase();
          return hay.includes(normalizedQ);
        })
      : mapped;

    const filteredByChip =
      filter === "ALL"
        ? filteredBySearch
        : filter === "PASSING"
        ? filteredBySearch.filter((x) => x.grade !== null && x.grade >= 75)
        : filter === "NEEDS"
        ? filteredBySearch.filter((x) => x.grade !== null && x.grade < 75)
        : filteredBySearch.filter((x) => x.grade === null);

    // optional: sort by grade desc, then name
    filteredByChip.sort((a, b) => {
      const ga = a.grade ?? -1;
      const gb = b.grade ?? -1;
      if (gb !== ga) return gb - ga;
      return a.subject_name.localeCompare(b.subject_name);
    });

    const counts = {
      ALL: filteredBySearch.length,
      PASSING: filteredBySearch.filter((x) => x.grade !== null && x.grade >= 75).length,
      NEEDS: filteredBySearch.filter((x) => x.grade !== null && x.grade < 75).length,
      NOGRADE: filteredBySearch.filter((x) => x.grade === null).length,
    };

    return { list: filteredByChip, counts };
  }, [offerings, query, filter]);


  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-black tracking-tight">Subjects</h1>
        <p className="text-slate-500 text-sm mt-2">Loading from backend…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-black tracking-tight">Subjects</h1>
        <p className="text-rose-600 text-sm font-bold mt-2">Failed to load subjects.</p>
      </main>
    );
  }

  return (
    <main className="sm:pt-4 md:p-6 mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        
        <h1 className="text-3xl font-lora font-extrabold tracking-wide text-slate-900">My Subjects</h1>

      </div>

      {/* Grid */}
      {cards.list.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-600">
          No subject offerings found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.list.map((subject) => {
            

            return (
              <Link
                to={`/student/subject-offering/${subject.id}`}
                key={subject.id}
                className="group"
              >
                <div className="h-full rounded-3xl p-4 border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden">
                {/* Subject + Teacher */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-black text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                      {subject.subject_name}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate font-semibold">
                        {subject.teacher}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject Details */}
                <div className="mt-5 grid grid-cols-3 gap-3">

                  {/* Section */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Users size={13} />
                      Section
                    </div>

                    <div className="mt-1 text-sm font-bold text-slate-700 truncate">
                      {subject.section_name || "N/A"}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <CalendarDays size={13} />
                      Schedule
                    </div>

                    <div className="mt-1 text-sm font-bold text-slate-700 truncate">
                      {subject.schedule || "N/A"}
                    </div>
                  </div>

                  {/* Room */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <DoorOpen size={13} />
                      Room
                    </div>

                    <div className="mt-1 text-sm font-bold text-slate-700 truncate">
                      {subject.room_number || "N/A"}
                    </div>
                  </div>

                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Open subject details
                  </span>

                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
