import React, { useMemo, useState, useEffect } from "react";
import { UserPlus, X, Search } from "lucide-react";

type Student = {
  id: number;
  school_id: string;
  first_name: string;
  last_name: string;
  email?: string;
};

type AddStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;

  // ✅ multi-select
  selectedStudentIds: number[];
  setSelectedStudentIds: React.Dispatch<React.SetStateAction<number[]>>;

  onSubmit: (e: React.FormEvent) => void;
  availableStudents: Student[];
};

const AddStudentModal = ({
  isOpen,
  onClose,
  selectedStudentIds,
  setSelectedStudentIds,
  onSubmit,
  availableStudents,
}: AddStudentModalProps) => {
  const [query, setQuery] = useState("");

  // reset search when opening
  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableStudents;

    return availableStudents.filter((s) => {
      const hay = `${s.school_id} ${s.first_name} ${s.last_name} ${s.email || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [availableStudents, query]);

  const isSelected = (id: number) => selectedStudentIds.includes(id);

  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (filtered.length === 0) return;
    const ids = filtered.map((s) => s.id);
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...ids])));
  };


  const clearSelection = () => setSelectedStudentIds([]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3 text-indigo-600">
            <UserPlus size={22} />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Add Existing Students
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Selected:{" "}
                <span className="font-bold">{selectedStudentIds.length}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Showing <span className="font-bold">{filtered.length}</span> of{" "}
                <span className="font-bold">{availableStudents.length}</span>
              </p>

            </div>
          </div>
          <button onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-3">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
            Search student
          </label>
          <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, first name, last name…"
              className="w-full bg-transparent outline-none text-sm text-slate-700"
            />
          </div>

          {/* Bulk actions */}
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Select all results
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Clear selection
            </button>
          </div>
        </div>

        {/* List + Submit */}
        <form onSubmit={onSubmit} className="px-6 pb-6">
          <div className="border rounded-xl overflow-hidden">
            <div className="max-h-72 overflow-y-auto divide-y">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  No students found.
                </div>
              ) : (
                filtered.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="h-4 w-4"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {s.school_id} — {s.last_name}, {s.first_name}
                      </p>
                      <p className="text-[11px] text-slate-400">ID: {s.id}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50 text-[11px] text-slate-500">
              Tip: Search then “Select all results” to add many quickly.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => { onClose(); clearSelection(); }}
              className="flex-1 py-2 font-bold text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedStudentIds.length === 0}
              className={`flex-1 py-2 font-bold rounded-lg ${
                selectedStudentIds.length === 0
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Add {selectedStudentIds.length} Student
              {selectedStudentIds.length === 1 ? "" : "s"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
