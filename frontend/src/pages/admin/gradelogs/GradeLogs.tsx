import { useEffect, useState } from "react";

interface LogEntry {
  timestamp: string;
  teacher: string; // "First Last"
  student: string; // "First Last"
  subject: string;
  activity: string;
  previousGrade: string;
  newGrade: string;
  change: string; // ✅ new: "prev → new" / "Created: ..."
  changeType: "Update" | "Create";
}

function toArrayMaybePaginated(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

function formatTimestamp(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts; // fallback raw
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GradeLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${base}/grade-logs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          setLogs([]);
          setErrorMsg(txt || "Failed to load grade logs.");
          return;
        }

        const payload = await res.json().catch(() => null);
        const list = toArrayMaybePaginated(payload);

        // ✅ Updated mapping to match NEW serializer output:
        // teacher, student, previousGrade, newGrade, change, changeType
        const mapped: LogEntry[] = list.map((x: any) => ({
          timestamp: x.timestamp,
          teacher: x.teacher,           // already "First Last"
          student: x.student,           // already "First Last"
          subject: x.subject,
          activity: x.activity,
          previousGrade: x.previousGrade ?? x.previous_grade ?? "N/A",
          newGrade: x.newGrade ?? x.new_grade ?? "—",
          change: x.change ?? `${x.previousGrade ?? "N/A"} → ${x.newGrade ?? "—"}`,
          changeType: x.changeType,     // "Update" | "Create"
        }));

        setLogs(mapped);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading grade logs.");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-1 font-sans">
      <div className="max-w-screen mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-1">
            Grade Change Logs
          </h1>
          <p className="text-slate-500">
            A record of all grade modifications made by teachers.
          </p>
        </header>

        {errorMsg ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-rose-600 font-semibold">
            {errorMsg}
          </div>
        ) : null}

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Timestamp
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Teacher
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Student
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Subject
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Activity
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Previous Grade
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    New Grade
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Change
                  </th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-400">
                    Change Type
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500" colSpan={9}>
                      No grade logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {log.teacher}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.student}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.activity}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {log.previousGrade}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {log.newGrade}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.change}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.changeType === "Update"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {log.changeType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
