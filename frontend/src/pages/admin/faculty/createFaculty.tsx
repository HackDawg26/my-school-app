import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Mail, Shield, Briefcase, CheckCircle } from "lucide-react";


{/* <button 
          onClick={() => navigate('/admin/faculty/add-faculty')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md shadow-indigo-100"
        >
          <UserPlus size={18} />
          Add Faculty Member
        </button> */}

// Using the same department list to keep data consistent
const departments = [
    "Filipino", "English", "Mathematics", "Science", 
    "Araling Panlipunan", "Edukasyon sa Pagpapakatao", "MAPEH"
];

export default function CreateFacultyPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        employeeId: "",
        designation: "Teacher I", // Default value
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // LOGGING DATA TO CONSOLE AS REQUESTED IN PREVIOUS STEPS
        console.log("=== NEW FACULTY CREATED ===");
        console.table(formData);

        setTimeout(() => {
            setLoading(false);
            alert(`Account created for ${formData.firstName} ${formData.lastName} in ${formData.department} department.`);
            navigate(-1);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm font-medium group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Faculty List
                </button>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 bg-white">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                            <UserPlus size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Add Faculty Member</h1>
                        <p className="text-slate-500 text-sm">Create a new account for teaching personnel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Name Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Maria" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Santos" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                        </div>

                        {/* ID & Department */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Shield size={14} /> Employee ID
                                </label>
                                <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="e.g. EMP-2024-001" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Briefcase size={14} /> Department
                                </label>
                                <select required name="department" value={formData.department} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Mail size={14} /> Official Email
                            </label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="m.santos@school.edu" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => navigate(-1)} 
                                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    "Creating..."
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}