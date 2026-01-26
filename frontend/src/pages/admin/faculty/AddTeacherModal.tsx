import { CheckCircle, Mail, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";

type Teacher = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type AddTeacherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onSelect: (teacherId: number) => void;
};

const AddTeacherModal = ({ isOpen, onClose, teachers, onSelect }: AddTeacherModalProps) => {
  const [query, setQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;

    return teachers.filter((t) =>
      `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(q)
    );
  }, [query, teachers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Assign Teacher to Subject</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teacher by name or email..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y">
          {filteredTeachers.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">
              No available teachers found
            </div>
          )}

          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
              <div>
                <p className="font-bold text-slate-800">
                  {teacher.last_name}, {teacher.first_name}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Mail size={14} /> {teacher.email}
                </p>
              </div>

              <button
                onClick={() => onSelect(teacher.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
              >
                <CheckCircle size={16} />
                Assign
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddTeacherModal;
