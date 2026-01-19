import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {UserPlus, ShieldCheck, Mail, Fingerprint, User } from "lucide-react";


const CreateTeacherAccountPage = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        studentId: "",
        role: "TEACHER",
        department: "",
        isAdviser: false,
        advisorySection: "", // New field
        advisoryYearLevel: "", // New field
        
        groups: [{
            subject: "", 
            section: "" , 
            yearLevel: "",
        }],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Logic to save the account (API call) would go here
        console.log("Saving Account Data:", formData);

        // Simulate API delay
        setTimeout(() => {
        setLoading(false);
        alert("Account created successfully!");
        navigate(-1); // Go back to the list page
        }, 1000);
    };
    // Add a new empty Subject/Section row
    const addGroup = () => {
        setFormData(prev => ({
            ...prev,
            groups: [...prev.groups, { subject: "", section: "", yearLevel: "", advisoryClass: false }]
        }));
    };

        // Remove a specific row
    const removeGroup = (index: number) => {
        setFormData(prev => ({
            ...prev,
            groups: prev.groups.filter((_, i) => i !== index)
        }));
    };

        // Update a specific field within a specific row
    const handleGroupChange = (index: number, field: "subject" | "section" | "yearLevel", value: string) => {
        const updatedGroups = [...formData.groups];
        updatedGroups[index][field] = value;
        setFormData(prev => ({ ...prev, groups: updatedGroups }));
        };

        // const handleToggleAdvisory = (index: number) => {
        //     setFormData(prev => ({
        //         ...prev,
        //         groups: prev.groups.map((g, i) => ({
        //         ...g,
        //         // Toggle the clicked one, but force all others to false
        //         advisoryClass: i === index ? !g.advisoryClass : false 
        //         }))
        //     }));
        // };  
        
    return (
        <div className=" bg-gray-100 dark:bg-gray-900">
            <div className="p-6 max-w-4xl items-center mx-auto">
            {/* Back Button */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus className="text-indigo-600" size={24} />
                            Create New Teacher Account
                        </h2>
                        <p className="text-sm text-gray-500">Fill in the details to register a new teacher in the system.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-1 space-y-3">
                        {/* Role Selection */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div 
                                onClick={() => setFormData(prev => ({ ...prev, isAdviser: !prev.isAdviser }))}
                                className={`group cursor-pointer flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 min-w-[200px] ${
                                    formData.isAdviser 
                                    ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100" 
                                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                                }`}
                                >
                                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                                    formData.isAdviser ? "bg-white/20 text-white" : "bg-white text-slate-400 shadow-sm"
                                }`}>
                                    <ShieldCheck size={24} />
                                </div>
                                
                                <div className="flex-1">
                                    <h4 className={`text-sm font-bold transition-colors ${
                                    formData.isAdviser ? "text-white" : "text-slate-900"
                                    }`}>
                                    Advisory Role
                                    </h4>
                                    <p className={`text-xs transition-colors ${
                                    formData.isAdviser ? "text-indigo-100" : "text-slate-500"
                                    }`}>
                                    {formData.isAdviser ? "Designated as Class Adviser" : "Standard Faculty Status"}
                                    </p>
                                </div>

                                {/* Modern Toggle Switch */}
                                <div className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                                    formData.isAdviser ? "bg-white/30" : "bg-slate-300"
                                }`}>
                                    <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                    formData.isAdviser ? "translate-x-5" : "translate-x-0"
                                    }`} />
                                </div>
                            </div>

                            

                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="" disabled>Select Department</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Science">Science</option>
                                <option value="English">English</option>
                                <option value="Filipino">Filipino</option>
                                <option value="Araling Panlipunan">Araling Panlipunan</option>
                                <option value="MAPEH">MAPEH</option>
                            </select>
                        </div>

                        {/* Conditional Advisory Details */}
                        {formData.isAdviser && (
                            <div className="mt-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 mb-3">

                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                                            Advisory Class Details
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-indigo-400 uppercase">Assigned Section</label>
                                        <input
                                        required
                                        type="text"
                                        name="advisorySection"
                                        placeholder="e.g. St. Peter"
                                        value={formData.advisorySection}
                                        onChange={handleChange}
                                        className="w-full p-2 text-sm border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-indigo-400 uppercase">Year Level</label>
                                        <select
                                        required
                                        name="advisoryYearLevel"
                                        value={formData.advisoryYearLevel}
                                        onChange={handleChange}
                                        className="w-full p-2 text-sm border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                        <option value="">Select Level</option>
                                        <option value="7">Year 7</option>
                                        <option value="8">Year 8</option>
                                        <option value="9">Year 9</option>
                                        <option value="10">Year 10</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <User size={14} /> First Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="firstName"
                                    placeholder="e.g. Juan"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    Last Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="lastName"
                                    placeholder="e.g. Dela Cruz"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Mail size={14} /> Email Address
                            </label>
                            <input
                                required
                                type="email"
                                name="email"
                                placeholder="juan@claroed.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ID Number */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Fingerprint size={14} /> Student / Faculty ID
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="studentId"
                                    placeholder="2024-XXXX"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <ShieldCheck size={14} /> Password
                                </label>
                                <input
                                    required
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700 uppercase">Assigned Classes</h3>
                                <button 
                                    type="button"
                                    onClick={addGroup}
                                    className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                > + Add Class
                                </button>
                            </div>

                            {formData.groups.map((group, index) => (
                                <div key={index} className="flex gap-2 items-end border-b pb-3 border-gray-200 last:border-0">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Subject</label>
                                        <input
                                            type="text"
                                            placeholder="Math"
                                            value={group.subject}
                                            onChange={(e) => handleGroupChange(index, "subject", e.target.value)}
                                            className="w-full p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Section</label>
                                        <input
                                            type="text"
                                            placeholder="Section A"
                                            value={group.section}
                                            onChange={(e) => handleGroupChange(index, "section", e.target.value)}
                                            className="w-full p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Year Level</label>
                                        <input
                                            type="text"
                                            placeholder="Grade 10"
                                            value={group.yearLevel}
                                            onChange={(e) => handleGroupChange(index, "yearLevel", e.target.value)}
                                            className="w-full p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* The container is now the LABEL itself */}
                                    
                                    {formData.groups.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeGroup(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            > ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            > Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300"
                            > {loading ? "Saving..." : "Save Account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTeacherAccountPage;