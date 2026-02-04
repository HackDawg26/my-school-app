import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Menu, X } from "lucide-react";
import type { SubjectOffering } from "./subjectOffering";

export default function SubjectLayout() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);

  const [offering, setOffering] = useState<SubjectOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // mobile tabs drawer
  const [tabsOpen, setTabsOpen] = useState(false);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg("Not authenticated.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const base = "http://127.0.0.1:8000/api";
        const res = await fetch(`${base}/subject-offerings/${subjectId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load offering");
        const data = (await res.json()) as SubjectOffering;
        setOffering(data);
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to load subject offering.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [subjectId, token]);

  // close drawer when route changes (subject id changes)
  useEffect(() => {
    setTabsOpen(false);
  }, [subjectId]);

  if (loading) return <div className="p-6 sm:p-10">Loading subject...</div>;
  if (!offering || errorMsg) return <div className="p-6 sm:p-10">{errorMsg ?? "Not found"}</div>;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    [
      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest transition",
      isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ].join(" ");

  const mobileTabClass = ({ isActive }: { isActive: boolean }) =>
    [
      "w-full inline-flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition",
      isActive ? "bg-slate-900 text-white" : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
    ].join(" ");

  return (
    <section className="min-h-screen bg-slate-50">
      {/* Sticky header (phone-friendly) */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
        <header className="mx-auto px-3 sm:px-4 md:px-6 py-4">
          {/* top row */}
          <div className="flex items-center gap-3">
            <Link
              to="/teacher/subject"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="truncate text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900">
                  {offering.name}
                </h1>
                <span className="hidden sm:inline text-sm font-bold text-slate-400 shrink-0">
                  • {offering.grade} — {offering.section}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 min-w-0">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <MapPin size={14} className="shrink-0" />
                  Room {offering.room_number}
                </span>
                {offering.teacher_name ? (
                  <span className="truncate">• {offering.teacher_name}</span>
                ) : null}
              </div>
            </div>

            {/* Mobile tabs button */}
            <button
              type="button"
              onClick={() => setTabsOpen(true)}
              className="sm:hidden inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Desktop / Tablet tabs */}
          <nav className="mt-4 hidden sm:flex flex-wrap gap-2">
            <NavLink end to="" className={tabClass}>
              Overview
            </NavLink>
            <NavLink to="files" className={tabClass}>
              Files
            </NavLink>
            <NavLink to="activities" className={tabClass}>
              Activities
            </NavLink>
            <NavLink to="grades" className={tabClass}>
              Grades
            </NavLink>
            <NavLink to="classlist" className={tabClass}>
              Classlist
            </NavLink>
          </nav>

          {/* Mobile quick tabs (2 rows, no scroll) */}
          <nav className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
            <NavLink end to="" className={tabClass}>
              Overview
            </NavLink>
            <NavLink to="files" className={tabClass}>
              Files
            </NavLink>
            <NavLink to="activities" className={tabClass}>
              Activities
            </NavLink>
            <NavLink to="grades" className={tabClass}>
              Grades
            </NavLink>
            <NavLink to="classlist" className={tabClass}>
              Classlist
            </NavLink>
          </nav>
        </header>
      </div>

      {/* Mobile Drawer (optional, easier on very small screens) */}
      {tabsOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setTabsOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white border-t border-slate-200 p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Navigate
                </div>
                <div className="font-black text-slate-900">{offering.name}</div>
              </div>
              <button
                onClick={() => setTabsOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <NavLink end to="" className={mobileTabClass} onClick={() => setTabsOpen(false)}>
                Overview <span className="text-xs opacity-70">→</span>
              </NavLink>
              <NavLink to="files" className={mobileTabClass} onClick={() => setTabsOpen(false)}>
                Files <span className="text-xs opacity-70">→</span>
              </NavLink>
              <NavLink to="activities" className={mobileTabClass} onClick={() => setTabsOpen(false)}>
                Activities <span className="text-xs opacity-70">→</span>
              </NavLink>
              <NavLink to="grades" className={mobileTabClass} onClick={() => setTabsOpen(false)}>
                Grades <span className="text-xs opacity-70">→</span>
              </NavLink>
              <NavLink to="classlist" className={mobileTabClass} onClick={() => setTabsOpen(false)}>
                Classlist <span className="text-xs opacity-70">→</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Page body */}
      <main className="mx-auto px-3 sm:px-4 md:px-6 py-6">
        <Outlet />
      </main>
    </section>
  );
}
