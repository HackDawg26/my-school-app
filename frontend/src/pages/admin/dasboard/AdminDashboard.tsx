import React, { useEffect, useState } from "react";
import { 
  UserPlus, 
  ClipboardList 
} from 'lucide-react';
import { authFetch } from '../../lib/api';


interface UserAccount {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const recentLogs = [
  { admin: "Pedro Garcia", action: "updated grade for", target: "Juan dela Cruz", subject: "Mathematics - Quiz 1", type: "Update" },
  { admin: "Maria Santos", action: "updated grade for", target: "Maria Clara", subject: "English - Essay 1", type: "Create" },
  { admin: "Ana Cruz", action: "updated grade for", target: "Jose Rizal", subject: "Science - Lab Report 2", type: "Update" },
  { admin: "Pedro Garcia", action: "updated grade for", target: "Andres Bonifacio", subject: "Mathematics - Quiz 1", type: "Create" },
  { admin: "Juan Reyes", action: "updated grade for", target: "Emilio Aguinaldo", subject: "Filipino - Pagsusulit 1", type: "Update" },
];

const AdminDashboard: React.FC = () => {
  
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
  students: 0,
  teachers: 0,
  subjects: 0,
});

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        authFetch("/api/user/"),
        authFetch("/api/dashboard/stats/"),
      ]);

      setUsers(await usersRes.json());
      setStats(await statsRes.json());

    } catch (error) {
      console.error("Failed to load admin dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  return (
    <div className="space-y-6">
      {/* 1. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  
  {/* Students */}
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-sm font-medium text-gray-500">Total Students</p>
    <h3 className="text-3xl font-bold text-gray-900 mt-1">
      {stats.students}
    </h3>
  </div>

  {/* Faculty */}
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-sm font-medium text-gray-500">Total Faculty</p>
    <h3 className="text-3xl font-bold text-gray-900 mt-1">
      {stats.teachers}
    </h3>
  </div>

  {/* Departments */}
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-sm font-medium text-gray-500">Total Departments</p>
    <h3 className="text-3xl font-bold text-gray-900 mt-1">
      {stats.subjects}
    </h3>
  </div>

</div>

      {/* 2. Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Accounts Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800">Recent Accounts Created</h2>
          </div>
          <div className="p-6 space-y-6">
            {users.map((user) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</h4>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase rounded-full">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grade Logs Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800">Recent Grade Logs</h2>
          </div>
          <div className="p-6 space-y-5">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-bold">{log.admin}</span> {log.action} <span className="font-bold">{log.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.subject}</p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md ${
                  log.type === 'Update' 
                  ? 'bg-amber-50 text-amber-600' 
                  : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;