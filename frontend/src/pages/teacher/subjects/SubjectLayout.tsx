import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import type { SubjectOffering } from "./subjectOffering";

export default function SubjectLayout() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);

  const [offering, setOffering] = useState<SubjectOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  if (loading) return <div className="p-10">Loading subject...</div>;
  if (!offering || errorMsg) return <div className="p-10">{errorMsg ?? "Not found"}</div>;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
      isActive ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
    }`;

  return (
    <section className="bg-slate-50/30 min-h-screen p-4 font-sans">
      {/* Header */}
      <header className="mx-auto mb-8">
        <Link
          to="/teacher/subject"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Subjects
        </Link>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {offering.name.toUpperCase()}
              </h1>
              <span className="h-6 w-px bg-slate-200" />
              <span className="text-lg font-medium text-slate-500">
                {offering.grade} — {offering.section}
              </span>
            </div>

            <p className="text-slate-500 flex items-center gap-3 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> Room {offering.room_number}
              </span>
              {offering.teacher_name ? <span>• {offering.teacher_name}</span> : null}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mt-6 flex items-center p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-200/60">
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

      <main className="mx-auto">
        {/* Pass offering via outlet context if you want later */}
        <Outlet />
      </main>
    </section>
  );
}
