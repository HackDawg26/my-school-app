import React from "react";
import { UserPlus, X } from "lucide-react";

type Teacher = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type AddAdviserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTeacherId: number | "";
  setSelectedTeacherId: React.Dispatch<React.SetStateAction<number | "">>;
  onSubmit: (e: React.FormEvent) => void;
  availableTeachers: Teacher[];
};

const AddAdviserModal = ({
  isOpen,
  onClose,
  selectedTeacherId,
  setSelectedTeacherId,
  onSubmit,
  availableTeachers,
}: AddAdviserModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3 text-indigo-600">
            <UserPlus size={22} />
            <h3 className="text-lg font-bold text-slate-900">
              Assign Adviser
            </h3>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Select Teacher
            </label>
            <select
              required
              value={selectedTeacherId}
              onChange={(e) =>
                setSelectedTeacherId(Number(e.target.value))
              }
              className="w-full p-2.5 border rounded-lg bg-slate-50"
            >
              <option value="">Choose a teacher</option>
              {availableTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.last_name}, {t.first_name} — {t.email}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 font-bold text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
            >
              Assign Adviser
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdviserModal;