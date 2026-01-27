import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type StudentRow = {
  id: number;
  school_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function SubjectClassListTab() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id || 0);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const base = "http://127.0.0.1:8000/api";
        const res = await fetch(`${base}/subject-offerings/${subjectId}/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    if (token && subjectId) run();
  }, [token, subjectId]);

  if (loading) return <div className="p-6">Loading classlist…</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Classlist ({students.length})
        </h2>
      </div>

      {students.length === 0 ? (
        <div className="text-slate-600">No students found.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {students.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">
                  {s.last_name}, {s.first_name}
                </div>
                <div className="text-xs text-slate-500">
                  {s.school_id} • {s.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
