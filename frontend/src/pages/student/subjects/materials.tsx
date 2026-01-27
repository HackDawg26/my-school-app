'use client';

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Folder, ExternalLink, Loader2 } from "lucide-react";

type MaterialResource = {
  id: number;
  title: string;
  link?: string | null;

  // subject context
  subject_offering_id: number;
  subject_name: string;
};

type SubjectGroup = {
  subject_offering_id: number;
  subject_name: string;
  count: number;
};

function getToken() {
  return localStorage.getItem("access");
}

export default function MaterialsPage() {
  const [resources, setResources] = useState<MaterialResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const base = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const run = async () => {
      const token = getToken();
      if (!token) {
        setErrorMsg("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // ✅ Recommended endpoint you add/maintain: /student/materials/
        const res = await fetch(`${base}/student/materials/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("materials load failed:", err);
          setErrorMsg("Failed to load materials.");
          setResources([]);
          return;
        }

        const data = (await res.json()) as MaterialResource[];
        setResources(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading materials.");
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const subjectsWithResources: SubjectGroup[] = useMemo(() => {
    const map = new Map<number, SubjectGroup>();

    for (const r of resources) {
      if (!map.has(r.subject_offering_id)) {
        map.set(r.subject_offering_id, {
          subject_offering_id: r.subject_offering_id,
          subject_name: r.subject_name,
          count: 0,
        });
      }
      map.get(r.subject_offering_id)!.count += 1;
    }

    return Array.from(map.values()).sort((a, b) =>
      a.subject_name.localeCompare(b.subject_name)
    );
  }, [resources]);

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center gap-2 text-slate-600 font-bold">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading materials…
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-3xl font-black">Materials</h1>
        <p className="text-rose-600 font-bold mt-2">{errorMsg}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">Materials</h1>
        <p className="text-slate-500 font-medium">
          Find all your learning resources, organized by subject.
        </p>
      </div>

      {subjectsWithResources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600 font-semibold">
          No resources available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {subjectsWithResources.map((s) => (
            <Link
              to={`/student/materials/${s.subject_offering_id}`}
              key={s.subject_offering_id}
              className="group flex"
            >
              <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                <div className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <Folder className="h-6 w-6 text-slate-700" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate">
                      {s.subject_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {s.count} resource{s.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Optional: quick preview of latest resources */}
      {resources.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Latest Resources
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y">
            {resources.slice(0, 6).map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{r.title}</div>
                  <div className="text-xs text-slate-500 truncate">{r.subject_name}</div>
                </div>
                {r.link ? (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                ) : (
                  <span className="text-xs font-bold text-slate-400">No link</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
