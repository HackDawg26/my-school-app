import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, ShieldCheck, Mail, Fingerprint, User, GraduationCap } from "lucide-react";

const CreateStudentAccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State - Added gradeLevel
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
    gradeLevel: "", // New Field
    role: "STUDENT", 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("Saving Account Data:", formData);

    setTimeout(() => {
      setLoading(false);
      alert("Account created successfully!");
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-indigo-600" size={24} />
                Create Student Account
              </h2>
              <p className="text-sm text-gray-500">Fill in the details to register a new student.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Role Display */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                {formData.role}
              </span>
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  required
                  type="text"
                  name="lastName"
                  placeholder="e.g. Dela Cruz"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                placeholder="juan.student@claroed.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Fingerprint size={14} /> Student ID
                </label>
                <input
                  required
                  type="text"
                  name="studentId"
                  placeholder="2024-XXXX"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Grade Level Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <GraduationCap size={14} /> Grade Level
                </label>
                <select
                  required
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer transition-all"
                >
                  <option value="">Select Grade</option>
                  {[7, 8, 9, 10].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShieldCheck size={14} /> Initial Password
              </label>
              <input
                required
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
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
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentAccountPage;