import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, ShieldCheck, Mail, Fingerprint, User } from "lucide-react";

const CreateAdminAccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
    role: "ADMIN", // Default role
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

  return (
    <div className=" bg-gray-100 dark:bg-gray-900">
        <div className="p-6 max-w-2xl items-center mx-auto">
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
            <div className="flex space-x-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Role</label>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{formData.role}</label>
                {/* <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Administrator</option>
                </select> */}
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

export default CreateAdminAccountPage;