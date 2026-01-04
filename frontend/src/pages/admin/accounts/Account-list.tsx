import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Search, 
  GraduationCap, 
  UsersRound, 
  MoreVertical,
  Mail
} from "lucide-react";

// Mock Data Types
type UserAccount = {
  id: string;
  name: string;
  email: string;
  department?: string;
  gradeLevel?: string;
  status: "Active" | "Inactive";
};

const AccountListPage = () => {
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Mock Data
  const teachers: UserAccount[] = [
    { id: "1", name: "John Doe", email: "john@claroed.com", department: "Science", status: "Active" },
    { id: "2", name: "Jane Smith", email: "jane@claroed.com", department: "Math", status: "Active" },
  ];

  const students: UserAccount[] = [
    { id: "101", name: "Alice Brown", email: "alice@student.com", gradeLevel: "Grade 10", status: "Active" },
    { id: "102", name: "Bob Wilson", email: "bob@student.com", gradeLevel: "Grade 11", status: "Inactive" },
  ];

  const currentList = activeTab === "teacher" ? teachers : students;

  return (
    <div className="p-4 max-w-screen mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-500 text-sm">Manage and monitor all school accounts.</p>
        </div>
        
        <button
          onClick={() => navigate("/admin/accounts/create")}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
        >
          <UserPlus size={18} />
          Create New Account
        </button>
      </div>

      {/* Tabs & Search Row */}
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
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}s...`}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                {activeTab === "teacher" ? "Department" : "Grade Level"}
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentList.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {activeTab === "teacher" ? user.department : user.gradeLevel}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-gray-200 rounded-md text-gray-400">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Sub-component for clean code
const TabButton = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pb-4 pt-2 px-1 border-b-2 transition-all font-medium ${
      active 
      ? "border-indigo-600 text-indigo-600" 
      : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AccountListPage;