import React, { useEffect, useState } from "react";
import { UserPlus, ClipboardList } from "lucide-react";
import { authFetch } from "../../lib/api";

// ---------------- Types ----------------

interface UserAccount {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

type GradeLogType = "Update" | "Create";

/**
 * Expected API shape from /api/grade-logs/
 * (based on the serializer we discussed)
 */
interface ApiGradeLog {
  timestamp: string;
  teacher: string;        // "First Last"
  student: string;        // "First Last"
  subject: string;        // e.g. "Mathematics"
  activity: string;       // e.g. "Quarterly Grade (Q1)" / "Quiz 1"
  previousGrade: string;  // e.g. "WW 18/20, PT 10/10, QA 15/20"
  newGrade: string;       // e.g. "WW 19/20, PT 10/10, QA 15/20"
  change: string;         // e.g. "WW 18/20 → WW 19/20" or "Created: ..."
  changeType: GradeLogType;
}

type DashboardStats = {
  students: number;
  teachers: number;
  subjects: number;
};

// ---------------- Helpers ----------------

function toArrayMaybePaginated(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

function formatNameFromUser(u: UserAccount) {
  const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return name || u.email || "—";
}

function formatTimestamp(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeText(v: any, fallback = "—") {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : fallback;
}

// ---------------- Component ----------------

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [gradeLogs, setGradeLogs] = useState<ApiGradeLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    subjects: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [usersRes, statsRes, logsRes] = await Promise.all([
          authFetch("/api/user/"),
          authFetch("/api/dashboard/stats/"),
          // If your backend doesn't support limit, it's fine—we slice below.
          authFetch("/api/grade-logs/?limit=5"),
        ]);

        // USERS
        if (!usersRes.ok) {
          const err = await usersRes.text().catch(() => "");
          throw new Error(`Failed to load users. ${err}`);
        }
        const usersJson = await usersRes.json();
        setUsers(Array.isArray(usersJson) ? usersJson : []);

        // STATS
        if (!statsRes.ok) {
          const err = await statsRes.text().catch(() => "");
          throw new Error(`Failed to load stats. ${err}`);
        }
        const statsJson = await statsRes.json();
        setStats({
          students: Number(statsJson?.students ?? 0),
          teachers: Number(statsJson?.teachers ?? 0),
          subjects: Number(statsJson?.subjects ?? 0),
        });

        // GRADE LOGS
        if (logsRes.ok) {
          const logsJson = await logsRes.json().catch(() => null);
          const list = toArrayMaybePaginated(logsJson) as ApiGradeLog[];

          // normalize & keep the latest 5
          const normalized: ApiGradeLog[] = list.slice(0, 5).map((x: any) => ({
            timestamp: safeText(x.timestamp),
            teacher: safeText(x.teacher),
            student: safeText(x.student),
            subject: safeText(x.subject),
            activity: safeText(x.activity, ""),
            previousGrade: safeText(x.previousGrade, "N/A"),
            newGrade: safeText(x.newGrade),
            change: safeText(x.change),
            changeType: x.changeType === "Create" ? "Create" : "Update",
          }));

          setGradeLogs(normalized);
        } else {
          // Don't break dashboard if logs endpoint isn't ready/allowed
          setGradeLogs([]);
        }
      } catch (err: any) {
        console.error("Failed to load admin dashboard", err);
        setErrorMsg(err?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-600 font-semibold">
        Loading admin dashboard…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-rose-600 font-semibold">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1) Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Students */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Students</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {stats.students}
          </h3>
        </div>

        {/* Faculty */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Faculty</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {stats.teachers}
          </h3>
        </div>

        {/* Departments */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Departments</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {stats.subjects}
          </h3>
        </div>
      </div>

      {/* 2) Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accounts Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800">
              Recent Accounts Created
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {users.length === 0 ? (
              <div className="text-sm text-gray-500">No users found.</div>
            ) : (
              users.slice(0, 6).map((user) => (
                <div key={user.id} className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {formatNameFromUser(user)}
                    </h4>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase rounded-full">
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Grade Logs Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800">Recent Grade Logs</h2>
          </div>

          <div className="p-6 space-y-5">
            {gradeLogs.length === 0 ? (
              <div className="text-sm text-gray-500">No grade logs yet.</div>
            ) : (
              gradeLogs.map((log, i) => {
                const label =
                  log.changeType === "Create" ? "created grade for" : "updated grade for";

                return (
                  <div key={i} className="flex justify-between items-start">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">{log.teacher}</span>{" "}
                        {label} <span className="font-bold">{log.student}</span>
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {log.subject}
                        {log.activity ? ` - ${log.activity}` : ""}
                      </p>

                      {/* Change summary */}
                      <p className="text-[11px] text-gray-500 mt-2">
                        <span className="font-bold text-gray-700">Change:</span>{" "}
                        {log.change}
                      </p>

                      {/* Optional: show previous/new explicitly */}
                      <p className="text-[11px] text-gray-400 mt-1">
                        <span className="font-semibold">Prev:</span>{" "}
                        {log.previousGrade}
                        <span className="mx-2">•</span>
                        <span className="font-semibold">New:</span> {log.newGrade}
                      </p>

                      <p className="text-[10px] text-gray-300 mt-1">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 px-3 py-1 text-[10px] font-bold uppercase rounded-md ${
                        log.changeType === "Update"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {log.changeType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
