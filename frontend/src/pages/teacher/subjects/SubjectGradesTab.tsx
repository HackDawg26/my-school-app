import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type QuarterlyGradeRow = {
  id: number;
  student: number;
  student_name: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  written_work_score: number;
  written_work_total: number;
  final_grade: number | null;
  remarks: string | null;
};

export default function SubjectGradesTab() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);
  const token = localStorage.getItem("access");

  const [rows, setRows] = useState<QuarterlyGradeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const base = "http://127.0.0.1:8000/api";
        const res = await fetch(`${base}/quarterly-grades/?SubjectOffering_id=${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    if (token && subjectId) run();
  }, [token, subjectId]);

  if (loading) return <div className="p-6">Loading grades…</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
        Grades
      </h2>

      {rows.length === 0 ? (
        <div className="text-slate-600">No quarterly grades yet.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Student</th>
                <th className="py-2">Quarter</th>
                <th className="py-2">WW</th>
                <th className="py-2">Final</th>
                <th className="py-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 font-semibold text-slate-800">{r.student_name}</td>
                  <td className="py-3">{r.quarter}</td>
                  <td className="py-3">
                    {r.written_work_score}/{r.written_work_total}
                  </td>
                  <td className="py-3 font-bold">{r.final_grade ?? "—"}</td>
                  <td className="py-3">{r.remarks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
