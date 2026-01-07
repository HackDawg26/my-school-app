import React, { useEffect, useState } from "react";

import { 
  UserPlus, 
  Search, 
  GraduationCap, 
  UsersRound, 
  MoreVertical,
  Mail,
  Settings,
  RefreshCw,
  Trash2,
} from "lucide-react";


import AccountRole from "./accountRole";
import EditModal from "./EditModal";

// Mock Data Types
type UserAccount = {
  id: string;
  lastname: string;
  firstname: string;
  email: string;
  department?: string;
  gradeLevel?: string;
  role?: string;
  password: any;
  status: "Active" | "Inactive";
};

const AccountListPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"student" | "teacher" | "admin">("student");
    const [searchQuery, setSearchQuery] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const handleCreateAccount = () => {
        setIsOpen(!isOpen);
        
    };

    useEffect(() => {
        setOpenMenuId(null); // Close any open menu when tab changes
    }, [activeTab]);

    // Mock Data State (Moved to state so we can actually "delete" or "update")
    const [students, setStudents] = useState<UserAccount[]>([
        { id: "4", lastname: " Brown", firstname:'Alice', email: "alice@student.com", gradeLevel: "Grade 10", password:'pw2777' ,  status: "Active" },
    ]);
    
    const [teachers, setTeachers] = useState<UserAccount[]>([
        { id: "109", lastname: "Doe", firstname:'john', email: "john@claroed.com", department: "Science", password:'pw2777' , status: "Active" },
        { id: "2", lastname: "baker", firstname:'master', email: "master@claroed.com", department: "Math", password:'pw2777' , status: "Active" },
    ]);

    
    const [admins, setAdmins] = useState<UserAccount[]>([
        { id: "5", lastname: "User", firstname:"admin", email: "admin@claroed.com", password:'pw2777' ,status: "Active" },
    ]);
    
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();

        const update = (list: UserAccount[]) =>
            list.map((u) => (u.id === selectedItem.id ? selectedItem : u));

        if (activeTab === "student") setStudents(update);
        if (activeTab === "teacher") setTeachers(update);
        if (activeTab === "admin") setAdmins(update);

        setIsEditModalOpen(false);
        setSelectedItem(null);
    };



    const handleToggleStatus = (id: string) => {
        // Helper to flip the status
        const updateLogic = (list: UserAccount[]) => 
            list.map(u => 
                u.id === id 
                    ? { ...u, status: u.status === "Active" ? ("Inactive" as const) : ("Active" as const) } 
                    : u
            );

        // Apply to the correct state based on tab
        if (activeTab === "teacher") {
            setTeachers(prev => updateLogic(prev));
        } else if (activeTab === "student") {
            setStudents(prev => updateLogic(prev));
        } else if (activeTab === "admin") {
            setAdmins(prev => updateLogic(prev));
        }

        setOpenMenuId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure?")) {
            // Use functional updates to ensure we have the latest state
            const filterFn = (prev: UserAccount[]) => prev.filter(u => u.id !== id);
            
            if (activeTab === "teacher") setTeachers(filterFn);
            else if (activeTab === "student") setStudents(filterFn);
            else if (activeTab === "admin") setAdmins(filterFn);
            
            setOpenMenuId(null);
        }
    };
    
    // Ensure this line uses the variables from your useState hooks
    const currentList = activeTab === "student" ? students : activeTab === "admin" ? admins : teachers;

    return (
        <div className="p-4 max-w-screen mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
                <p className="text-gray-500 text-sm">Manage and monitor all school accounts.</p>
            </div>
            
            {/* () => navigate("/admin/accounts/create") */}

            <button
                onClick={handleCreateAccount}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
                <UserPlus size={18} /> Create New Account
            </button>
            
            <AccountRole isOpen={isOpen}/>
            
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
                <TabButton 
                    active={activeTab === "admin"} 
                    onClick={() => setActiveTab("admin")}
                    icon={<Settings size={18} />}
                    label="Admins"
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-y-auto h-screen ">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                        {activeTab === "teacher" ? "Department" : activeTab === "student" ? "Grade Level" : "Role"}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Password</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 ">
                    {currentList.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            {/* 1. Name Cell */}
                            <td className="px-6 py-4 font-medium text-gray-900">{user.firstname} {user.lastname}</td>
                            
                            {/* 2. Email Cell */}
                            <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    {user.email}
                                </div>
                            </td>
                            
                            {/* 3. Dynamic Info Cell (Department OR Grade Level) */}
                            <td className="px-6 py-4 text-gray-600">
                                {/* We use || "N/A" for Admins who have neither */}
                                {user.department || user.gradeLevel || "System Admin"}
                            </td>

                            <td className="px-6 py-4">
                                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">
                                    {user.password}
                                </code>
                            </td>
                            
                            {/* 4. Status Cell */}
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {user.status}
                                </span>
                            </td>

                            {/* 5. ACTIONS CELL - Ensure this is NOT wrapped in a teacher check */}
                            <td className="px-6 py-4 text-right relative">
                                <button 
                                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {openMenuId === user.id && (
                                    <div className="">
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>

                                        <div className="absolute right-0 mt-2 w-44  bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                            {/* Toggle Button - Works for all */}
                                            <button 
                                                onClick={() => handleToggleStatus(user.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                                            >
                                                <RefreshCw size={14} className="text-indigo-500" /> 
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
                                                <RefreshCw size={14} className="text-indigo-500" /> Edit Account
                                            </button>
                                            
                                            <div className="border-t border-gray-100 my-1"></div>
                                            
                                            {/* Delete Button - Works for all because handleDelete checks activeTab */}
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                            >
                                                <Trash2 size={14} /> Delete Account
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            
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