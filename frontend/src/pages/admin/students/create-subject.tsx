import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, GraduationCap, UserCheck, ArrowLeft } from "lucide-react";

export default function CreateSubjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State updated for Subject Creation
    const [formData, setFormData] = useState({
        subjectTitle: "",
        section: "",
        gradeLevel: "",
        isAdvisory: false,
        students: [] as string[], // Array of Student IDs
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggleAdvisory = () => {
        setFormData(prev => ({ ...prev, isAdvisory: !prev.isAdvisory }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        console.log("Creating Subject:", formData);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Subject created successfully!");
            navigate(-1);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="text-indigo-600" size={24} />
                                Create New Subject
                            </h2>
                            <p className="text-sm text-gray-500">Define subject details and assign a section.</p>
                        </div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        
                        {/* Primary Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subject Title */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <BookOpen size={14} /> Subject Title
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="subjectTitle"
                                    placeholder="e.g. Advanced Algebra"
                                    value={formData.subjectTitle}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Grade Level Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <GraduationCap size={14} /> Grade Level
                                </label>
                                <select
                                    required
                                    name="gradeLevel"
                                    value={formData.gradeLevel}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="">Select Grade</option>
                                    {[7, 8, 9, 10, 11, 12].map(num => (
                                        <option key={num} value={num}>Grade {num}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Section Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users size={14} /> Section Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="section"
                                    placeholder="e.g. Diamond"
                                    value={formData.section}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Advisory Toggle Container */}
                            <div className="flex flex-col justify-end">
                                <label 
                                    className={`flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-all ${
                                        formData.isAdvisory 
                                        ? "bg-indigo-50 border-indigo-200" 
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <UserCheck size={16} className={formData.isAdvisory ? "text-indigo-600" : "text-gray-400"} />
                                        <span className={`text-sm font-medium ${formData.isAdvisory ? "text-indigo-900" : "text-gray-600"}`}>
                                            Set as Advisory Class
                                        </span>
                                    </div>
                                    <div className="relative inline-flex h-5 w-9 items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={formData.isAdvisory}
                                            onChange={handleToggleAdvisory}
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full"></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Student Assignment Section */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Student Enrollment</h3>
                            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                                <Users size={32} className="mb-2 opacity-20" />
                                <p className="text-sm text-center">
                                    Student selection list will be populated based on the <br />
                                    <span className="font-semibold text-gray-500">Grade Level</span> selected above.
                                </p>
                                <button type="button" className="mt-4 text-xs font-bold text-indigo-600 hover:underline">
                                    + Browse Students
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex items-center gap-3">
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
                                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating Subject..." : "Create Subject"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}