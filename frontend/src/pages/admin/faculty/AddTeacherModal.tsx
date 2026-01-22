import { CheckCircle, Mail, X } from "lucide-react";
import React from "react";

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

const AddTeacherModal = ({
  isOpen,
  onClose,
  teachers,
  onSelect,
}: AddTeacherModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">
            Assign Teacher to Subject
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Teacher List */}
        <div className="max-h-[420px] overflow-y-auto divide-y">
          {teachers.length === 0 && (
            <div className="p-6 text-center text-slate-500">
              No available teachers
            </div>
          )}

          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="p-5 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-bold text-slate-800">
                  {teacher.last_name}, {teacher.first_name}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Mail size={14} />
                  {teacher.email}
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
