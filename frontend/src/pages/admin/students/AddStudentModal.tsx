import React from "react";
import { UserPlus, X, Fingerprint } from "lucide-react";

type NewStudent = {
  studentId: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AddStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  newStudent: NewStudent;
  setNewStudent: React.Dispatch<React.SetStateAction<NewStudent>>;
  onSubmit: (e: React.FormEvent) => void;
};

const AddStudentModal = ({
  isOpen,
  onClose,
  newStudent,
  setNewStudent,
  onSubmit,
}: AddStudentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3 text-indigo-600">
            <UserPlus size={24} />
            <h3 className="text-xl font-bold text-slate-900">
              Enroll New Student
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* ID + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                Student ID
              </label>
              <div className="relative">
                <Fingerprint
                  size={16}
                  className="absolute left-3 top-3 text-slate-300"
                />
                <input
                  required
                  placeholder="STU-XXX"
                  value={newStudent.studentId}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      studentId: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                Status
              </label>
              <select
                value={newStudent.status}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    status: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                First Name
              </label>
              <input
                required
                value={newStudent.firstName}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                Last Name
              </label>
              <input
                required
                value={newStudent.lastName}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    lastName: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
              Official Email
            </label>
            <input
              required
              type="email"
              placeholder="name@claroed.edu"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  email: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 text-sm"
            >
              Enroll Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
