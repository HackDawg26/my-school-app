import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronRight,
  GraduationCap,
  User,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";

type SubjectOffering = {
  id: number;
  name: string;
  teacher_name?: string;
  average?: number;        // optional
  pendingTasks?: number;   // optional (you used it as "progress")
};

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
  const [offerings, setOfferings] = useState<SubjectOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${base}/subject-offerings/my/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("subject-offerings/my failed:", err);
          setErrorMsg("Failed to load subjects.");
          setOfferings([]);
          return;
        }

        const data = (await res.json()) as SubjectOffering[];
        setOfferings(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading subjects.");
        setOfferings([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  const cards = useMemo(() => {
    const normalizedQ = query.trim().toLowerCase();

    const mapped = offerings.map((o) => {
      const grade = typeof o.average === "number" ? Math.round(o.average) : null;
      const progress = clamp(safeNumber(o.pendingTasks, 0)); // keep your current meaning
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
          const hay = `${x.name} ${x.teacher}`.toLowerCase();
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
      return a.name.localeCompare(b.name);
    });

    const counts = {
      ALL: filteredBySearch.length,
      PASSING: filteredBySearch.filter((x) => x.grade !== null && x.grade >= 75).length,
      NEEDS: filteredBySearch.filter((x) => x.grade !== null && x.grade < 75).length,
      NOGRADE: filteredBySearch.filter((x) => x.grade === null).length,
    };

    return { list: filteredByChip, counts };
  }, [offerings, query, filter]);

  const headerStats = useMemo(() => {
    const grades = offerings
      .map((o) => (typeof o.average === "number" ? o.average : null))
      .filter((v): v is number => typeof v === "number");

    const overall = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : null;

    return {
      subjectCount: offerings.length,
      overallAvg: overall != null ? overall.toFixed(1) : "—",
    };
  }, [offerings]);

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-black tracking-tight">Subjects</h1>
        <p className="text-slate-500 text-sm mt-2">Loading from backend…</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-black tracking-tight">Subjects</h1>
        <p className="text-rose-600 text-sm font-bold mt-2">{errorMsg}</p>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Subjects</h1>
          <p className="text-slate-500 text-sm mt-1">
            Overview of your learning areas and current standing.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200">
              <GraduationCap size={16} className="text-slate-500" />
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Overall Avg</div>
              <div className="text-sm font-black text-slate-900">{headerStats.overallAvg}</div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Subjects</div>
              <div className="text-sm font-black text-slate-900">{headerStats.subjectCount}</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-[360px]">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subject or teacher…"
              className="w-full bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["ALL", `All (${cards.counts.ALL})`],
            ["PASSING", `Passing (${cards.counts.PASSING})`],
            ["NEEDS", `Needs Attention (${cards.counts.NEEDS})`],
            ["NOGRADE", `No Grade (${cards.counts.NOGRADE})`],
          ] as const
        ).map(([key, label]) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {cards.list.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-600">
          No subject offerings found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.list.map((subject) => {
            const StatusIcon = subject.StatusIcon;
            const gradeText = subject.grade === null ? "—" : String(subject.grade);
            const progressLabel =
              subject.progress >= 100 ? "Completed" : subject.progress === 0 ? "Not started" : "In progress";

            return (
              <Link
                to={`/student/subject-offering/${subject.id}`}
                key={subject.id}
                className="group"
              >
                <div className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden">
                  {/* top strip */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-black text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                          {subject.name}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <User size={14} className="text-slate-400" />
                          <span className="truncate font-semibold">{subject.teacher}</span>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border ${subject.statusPill}`}>
                        <StatusIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {subject.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* mini stats */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Average
                        </div>
                        <div className="mt-1 text-2xl font-black text-slate-900">{gradeText}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Term Status
                        </div>
                        <div className="mt-1 text-sm font-black text-slate-900">{progressLabel}</div>
                      </div>
                    </div>

                    {/* progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Completion</span>
                        <span className="text-slate-900 font-black">{subject.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${subject.ringColor} transition-all duration-700`}
                          style={{ width: `${clamp(subject.progress)}%` }}
                        />
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
