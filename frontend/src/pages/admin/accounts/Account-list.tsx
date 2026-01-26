import React, { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  GraduationCap,
  UsersRound,
  MoreVertical,
  Mail,
  Settings,
  Trash2,
} from "lucide-react";

import AccountRole from "./accountRole";
import EditModal from "./EditModal";
import { useLocation } from "react-router-dom";

// ✅ Unified UserAccount type (Department -> Subjects)
type UserAccount = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;

  // ✅ TEACHER: subjects list (backend should return `subjects`)
  subjects?: { id: number; name: string }[];

  // ✅ STUDENT
  gradeLevel?: string;

  role: "STUDENT" | "TEACHER" | "ADMIN";
  status: "Active" | "Inactive";
};

const AccountListPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserAccount | null>(null);

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"student" | "teacher" | "admin">(
    () => location.state?.activeTab || "student"
  );

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  // --- Load users from Django API ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access");

        const res = await fetch("http://127.0.0.1:8000/api/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();

        const mapped: UserAccount[] = (Array.isArray(data) ? data : []).map(
          (u: any) => ({
            id: String(u.id),
            firstname: u.first_name ?? "",
            lastname: u.last_name ?? "",
            email: u.email ?? "",
            role: u.role,

            // ✅ STUDENT
            gradeLevel: u.student_profile?.grade_level ?? undefined,

            // ✅ TEACHER: subjects array (must be returned by backend)
            subjects: Array.isArray(u.subjects) ? u.subjects : [],

            status: u.status === "ACTIVE" ? "Active" : "Inactive",
          })
        );

        setUsers(mapped);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateAccount = () => setIsOpen((s) => !s);

  // --- Filter & Search ---
  const currentList = useMemo(() => {
    const filteredByRole = users.filter((u) => {
      if (activeTab === "student") return u.role === "STUDENT";
      if (activeTab === "teacher") return u.role === "TEACHER";
      return u.role === "ADMIN";
    });

    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredByRole;

    return filteredByRole.filter((u) => {
      const subjectText =
        u.role === "TEACHER"
          ? (u.subjects ?? []).map((s) => s?.name ?? "").join(" ")
          : "";
      const hay = `${u.firstname} ${u.lastname} ${u.email} ${subjectText}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, activeTab, searchQuery]);

  // --- Actions ---
  const handleToggleStatus = async (user: UserAccount) => {
    try {
      const token = localStorage.getItem("access");
      const newStatus = user.status === "Active" ? "INACTIVE" : "ACTIVE";

      const res = await fetch(`http://127.0.0.1:8000/api/user/${user.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: newStatus === "ACTIVE" ? "Active" : "Inactive" }
            : u
        )
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("access");

      const res = await fetch(`http://127.0.0.1:8000/api/user/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const token = localStorage.getItem("access");

    const payload: any = {
      first_name: selectedItem.firstname,
      last_name: selectedItem.lastname,
      email: selectedItem.email,
    };

    // ✅ STUDENT update
    if (selectedItem.role === "STUDENT") {
      payload.student_profile = { grade_level: selectedItem.gradeLevel };
    }

    // ✅ PASSWORD update (optional)
    if (selectedItem.password?.trim()) {
      payload.password = selectedItem.password;
    }

    const res = await fetch(`http://127.0.0.1:8000/api/user/${selectedItem.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      return;
    }

    // ✅ update UI
    setUsers((prev) => prev.map((u) => (u.id === selectedItem.id ? selectedItem : u)));

    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="p-4 max-w-screen mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-500 text-sm">Manage and monitor all school accounts.</p>
        </div>

        <button
          onClick={handleCreateAccount}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
        >
          <UserPlus size={18} /> Create New Account
        </button>

        <AccountRole isOpen={isOpen} />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 gap-4">
        <div className="flex gap-8">
          <TabButton
            active={activeTab === "student"}
            onClick={() => setActiveTab("student")}
            icon={<GraduationCap size={18} />}
            label="Students"
          />
          <TabButton
            active={activeTab === "teacher"}
            onClick={() => setActiveTab("teacher")}
            icon={<UsersRound size={18} />}
            label="Teachers"
          />
          <TabButton
            active={activeTab === "admin"}
            onClick={() => setActiveTab("admin")}
            icon={<Settings size={18} />}
            label="Admins"
          />
        </div>

        <div className="relative mb-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab}s...`}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-y-auto h-screen">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  {activeTab === "teacher"
                    ? "Subject"
                    : activeTab === "student"
                    ? "Grade Level"
                    : "Role"}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentList.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.firstname} {user.lastname}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {user.email}
                    </span>
                  </td>

                  {/* ✅ Subject column for teachers */}
                  <td className="px-6 py-4 text-gray-600">
                    {user.role === "TEACHER" ? (
                      user.subjects && user.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.subjects.map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No Subject</span>
                      )
                    ) : user.role === "STUDENT" ? (
                      user.gradeLevel || "N/A"
                    ) : (
                      "System Admin"
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === user.id ? null : user.id)
                      }
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuId === user.id && (
                      <div>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          >
                            Set as {user.status === "Active" ? "Inactive" : "Active"}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(user);
                              setIsEditModalOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          >
                            Edit Account
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={14} />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && currentList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        selectedItem={selectedItem}
        activeTab={activeTab}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
};

// --- TabButton Subcomponent ---
const TabButton = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pb-4 pt-2 px-1 border-b-2 transition-all font-medium ${
      active
        ? "border-indigo-600 text-indigo-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
  >
    {icon} {label}
  </button>
);

export default AccountListPage;
