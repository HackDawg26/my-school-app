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
    
    groups: [{
         subject: "", 
         section: "" , 
         yearLevel: "",
         advisoryClass: false,
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

    const handleToggleAdvisory = (index: number) => {
        setFormData(prev => ({
            ...prev,
            groups: prev.groups.map((g, i) => ({
            ...g,
            // Toggle the clicked one, but force all others to false
            advisoryClass: i === index ? !g.advisoryClass : false 
            }))
        }));
    };  
       
  return (
    <div className=" bg-gray-100 dark:bg-gray-900">
        <div className="p-6 max-w-4xl items-center mx-auto">
        {/* Back Button */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-indigo-600" size={24} />
                Create New Account
            </h2>
            <p className="text-sm text-gray-500">Fill in the details to register a new user in the system.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3">
            {/* Role Selection */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</label>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        {formData.role}
                    </span>
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
                    >
                    + Add Class
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
                    <label 
                        key={index}
                        className={`flex flex-col items-center gap-2 p-1 rounded-xl border transition-all cursor-pointer select-none min-w-[100px]
                            ${group.advisoryClass 
                            ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                            : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                            }`}
                        >
                        {/* Label text on top */}
                        <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                            group.advisoryClass ? "text-indigo-600" : "text-gray-400"
                        }`}>
                            Advisory
                        </span>

                        {/* Hidden Input */}
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={group.advisoryClass}
                            onChange={() => handleToggleAdvisory(index)} // Use the helper function from the previous step
                        />

                        {/* Visual Toggle Switch at bottom */}
                        <div className="relative h-5 w-9 rounded-full bg-gray-300 transition-all 
                            peer-checked:bg-indigo-600 
                            after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 
                            after:rounded-full after:bg-white after:transition-all after:content-[''] 
                            peer-checked:after:translate-x-4 shadow-inner">
                        </div>
                    </label>

                    {formData.groups.length > 1 && (
                        <button 
                        type="button" 
                        onClick={() => removeGroup(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                        ✕
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
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300"
                >
                {loading ? "Saving..." : "Save Account"}
                </button>
            </div>
            </form>
        </div>
        </div>
    </div>
    

   
  );
};

export default CreateTeacherAccountPage;