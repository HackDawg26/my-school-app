import { X } from "lucide-react";

type EditModalProps = {
  isOpen: boolean;
  selectedItem: any;
  activeTab: "student" | "teacher" | "admin";
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<any>>;
};

const EditModal = ({
  isOpen,
  selectedItem,
  activeTab,
  onClose,
  onSave,
  setSelectedItem,
}: EditModalProps) => {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Edit Account</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-8 space-y-4">
          {/* Name Fields */}
          <div className="flex gap-2">
            <div className="space-y-2 w-1/2">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                First Name
              </label>
              <input
                required
                type="text"
                value={selectedItem.firstname}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, firstname: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2 w-1/2">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Last Name
              </label>
              <input
                required
                type="text"
                value={selectedItem.lastname}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, lastname: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Email
            </label>
            <input
              required
              type="email"
              value={selectedItem.email}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, email: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Conditional Fields */}
          {activeTab === "teacher" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Department
              </label>
              <input
                value={selectedItem.department || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, department: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {activeTab === "student" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Grade Level
              </label>
            <select
              required
              value={selectedItem.gradeLevel || ""}
              onChange={(e) =>
                setSelectedItem({
                ...selectedItem,
                gradeLevel: e.target.value, // "GRADE_7", "GRADE_8", etc.
              })
            }
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Grade</option>
            {["GRADE_7","GRADE_8","GRADE_9","GRADE_10"].map((grade) => (
              <option key={grade} value={grade}>
                {grade.replace("GRADE_", "Grade ")}
              </option>
            ))}
          </select>
        </div>
      )}


          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={selectedItem.password || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, password: e.target.value })
              }
              placeholder="Enter new password to change"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
