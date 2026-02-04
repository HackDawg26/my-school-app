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

  subjects?: { id: number; name: string }[];
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

            gradeLevel: u.student_profile?.grade_level ?? undefined,
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

    if (selectedItem.role === "STUDENT") {
      payload.student_profile = { grade_level: selectedItem.gradeLevel };
    }

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

    setUsers((prev) => prev.map((u) => (u.id === selectedItem.id ? selectedItem : u)));

    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Account Management</h1>
          <p className="text-slate-500 text-sm">Manage and monitor all school accounts.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <button
            onClick={handleCreateAccount}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-black text-sm transition-all shadow-sm"
          >
            <UserPlus size={18} /> Create Account
          </button>

          <AccountRole isOpen={isOpen} />
        </div>
      </div>

      {/* Tabs & Search (phone friendly) */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <TabButton
              active={activeTab === "student"}
              onClick={() => setActiveTab("student")}
              icon={<GraduationCap size={16} />}
              label="Students"
            />
            <TabButton
              active={activeTab === "teacher"}
              onClick={() => setActiveTab("teacher")}
              icon={<UsersRound size={16} />}
              label="Teachers"
            />
            <TabButton
              active={activeTab === "admin"}
              onClick={() => setActiveTab("admin")}
              icon={<Settings size={16} />}
              label="Admins"
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}s...`}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Desktop table + Mobile cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading users...</div>
        ) : (
          <>
            {/* ✅ Desktop/tablet */}
            <div className="hidden md:block">
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full text-left  border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                        Name
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                        Email
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                        {activeTab === "teacher"
                          ? "Subjects"
                          : activeTab === "student"
                          ? "Grade Level"
                          : "Role"}
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {currentList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {user.firstname} {user.lastname}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            {user.email}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {user.role === "TEACHER" ? (
                            user.subjects && user.subjects.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {user.subjects.map((s) => (
                                  <span
                                    key={s.id}
                                    className="px-2 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  >
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">No Subject</span>
                            )
                          ) : user.role === "STUDENT" ? (
                            user.gradeLevel || "N/A"
                          ) : (
                            "System Admin"
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "px-2 py-1 rounded-full text-xs font-black",
                              user.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700",
                            ].join(" ")}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                            aria-label="Open actions"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === user.id && (
                            <div>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-4 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1">
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                                >
                                  Set as {user.status === "Active" ? "Inactive" : "Active"}
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedItem(user);
                                    setIsEditModalOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                                >
                                  Edit Account
                                </button>

                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
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
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No accounts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Mobile cards */}
            <div className="md:hidden">
              <div className="max-h-[72vh] overflow-auto p-3 space-y-3">
                {currentList.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 text-center">
                    No accounts found.
                  </div>
                ) : (
                  currentList.map((user) => (
                    <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 truncate">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="mt-1 text-sm text-slate-600 flex items-center gap-2 min-w-0">
                            <Mail size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={[
                              "px-2 py-1 rounded-full text-[11px] font-black",
                              user.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700",
                            ].join(" ")}
                          >
                            {user.status}
                          </span>

                          <button
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            className="p-2 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            aria-label="Open actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>

                      {/* role-specific line */}
                      <div className="mt-3 text-sm text-slate-700">
                        {user.role === "TEACHER" ? (
                          user.subjects && user.subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {user.subjects.slice(0, 4).map((s) => (
                                <span
                                  key={s.id}
                                  className="px-2 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100"
                                >
                                  {s.name}
                                </span>
                              ))}
                              {user.subjects.length > 4 ? (
                                <span className="px-2 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
                                  +{user.subjects.length - 4}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-slate-500">No Subject</span>
                          )
                        ) : user.role === "STUDENT" ? (
                          <span>
                            <span className="text-slate-500">Grade Level: </span>
                            <span className="font-bold">{user.gradeLevel || "N/A"}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">System Admin</span>
                        )}
                      </div>

                      {/* Actions menu (mobile: full width dropdown) */}
                      {openMenuId === user.id && (
                        <div className="mt-3 rounded-2xl border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50"
                          >
                            Set as {user.status === "Active" ? "Inactive" : "Active"}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(user);
                              setIsEditModalOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 border-t border-slate-200"
                          >
                            Edit Account
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-200"
                          >
                            Delete Account
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
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

// --- TabButton Subcomponent (mobile-first) ---
const TabButton = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={[
      "shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition border",
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
    ].join(" ")}
  >
    {icon}
    <span className="uppercase tracking-wider text-[12px]">{label}</span>
  </button>
);

export default AccountListPage;
