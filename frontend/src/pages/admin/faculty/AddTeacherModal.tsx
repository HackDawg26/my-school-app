import { CheckCircle, Mail, Shield, X } from 'lucide-react';
import React from 'react'

type AddTeacherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  newTeacher: {
    firstName: string;
    lastName: string;
    email: string;
    advisory: string;
  };
  setNewTeacher: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      email: string;
      advisory: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
};


const AddTeacherModal = ({
    isOpen,
    onClose,
    newTeacher,
    setNewTeacher,
    onSubmit,
}: AddTeacherModalProps) => {

    if (!isOpen) return null;

    return (
    <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                    Add Faculty Member
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                        First Name
                    </label>
                    <input
                        required
                        value={newTeacher.firstName}
                        onChange={(e) =>
                        setNewTeacher({ ...newTeacher, firstName: e.target.value })
                        }
                        className="w-full p-3 bg-slate-50 border rounded-lg text-sm"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                        Last Name
                    </label>
                    <input
                        required
                        value={newTeacher.lastName}
                        onChange={(e) =>
                        setNewTeacher({ ...newTeacher, lastName: e.target.value })
                        }
                        className="w-full p-3 bg-slate-50 border rounded-lg text-sm"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                    <Mail size={12} /> Email Address
                    </label>
                    <input
                    required
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) =>
                        setNewTeacher({ ...newTeacher, email: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border rounded-lg text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                    <Shield size={12} /> Advisory Class
                    </label>
                    <input
                    value={newTeacher.advisory}
                    onChange={(e) =>
                        setNewTeacher({ ...newTeacher, advisory: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border rounded-lg text-sm"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-slate-600 font-bold rounded-xl"
                    >
                    Cancel
                    </button>

                    <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                    <CheckCircle size={16} />
                    Save Teacher
                    </button>
                </div>
                </form>
            </div>
            </div>
    </div>
  )
}

export default AddTeacherModal