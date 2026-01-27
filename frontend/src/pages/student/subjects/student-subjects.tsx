import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type SubjectOffering = {
  id: number;
  name: string;
  teacher_name?: string;
  average?: number;        // if your serializer provides it
  pendingTasks?: number;   // if your serializer provides it (optional)
};

export default function SubjectsPage() {
  const [offerings, setOfferings] = useState<SubjectOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

        // ✅ NEW endpoint
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
    return offerings.map((o) => {
      const grade = typeof o.average === "number" ? Math.round(o.average) : null;
      const isPassing = grade !== null ? grade >= 75 : true;

      // “progress” is optional — use pendingTasks if you have it, otherwise show 0.
      const progress = typeof o.pendingTasks === "number" ? o.pendingTasks : 0;

      return { ...o, grade, isPassing, progress };
    });
  }, [offerings]);

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-slate-500 text-sm">Loading from backend…</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="flex-1 p-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-rose-600 text-sm font-bold">{errorMsg}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-1">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground text-sm">
          An overview of academic performance per learning area.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((subject) => (
          <Link
            to={`/student/subject-offering/${subject.id}`}
            key={subject.id}
            className="group"
          >
            <div className="rounded-2xl border border-slate-200 bg-white text-card-foreground shadow-sm flex h-full flex-col transition-all group-hover:shadow-xl group-hover:border-indigo-200 group-hover:-translate-y-1 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col space-y-1 p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                      {subject.teacher_name ?? "—"}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                      subject.grade === null
                        ? "bg-slate-50 text-slate-500"
                        : subject.isPassing
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {subject.grade === null
                      ? "No Grade Yet"
                      : subject.isPassing
                      ? "Passed"
                      : "Below Criteria"}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="px-4 grow">
                <div className="mb-3 flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                  <span className="text-slate-400">Term Completion</span>
                  <span className="text-slate-900">{subject.progress}%</span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      subject.isPassing ? "bg-indigo-500" : "bg-red-500"
                    }`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 mt-2 italic">
                  {subject.progress === 100 ? "All quarters encoded" : "Ongoing grading period"}
                </p>
              </div>

              {/* Footer grade */}
              <div className="flex items-center px-4 py-2 bg-slate-50/50 border-t border-slate-50">
                <div className="flex w-full justify-between items-center">
                  <span className="text-[11px] font-black text-slate-500 uppercase">
                    Average Grade
                  </span>
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-black text-3xl tracking-tighter ${
                        subject.grade === null
                          ? "text-slate-300"
                          : subject.isPassing
                          ? "text-slate-900"
                          : "text-red-600"
                      }`}
                    >
                      {subject.grade ?? "—"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 -mt-1 uppercase">
                      SF9 Official Entry
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {cards.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-600">
            No subject offerings found for your section.
          </div>
        ) : null}
      </div>
    </main>
  );
}
