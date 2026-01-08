import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, GraduationCap, ArrowLeft, Search, Plus, X, User } from "lucide-react";

// Mock Data
const MOCK_STUDENTS = [

    { id: "STU001", firstName: "Juan", lastName: "Dela Cruz", email: "juan@school.edu", gradeLevel: "7" },

    { id: "STU002", firstName: "Maria", lastName: "Clara", email: "maria@school.edu", gradeLevel: "7" },

    { id: "STU003", firstName: "Juan", lastName: "Dela Cruz", email: "juan@school.edu", gradeLevel: "7" },

    { id: "STU004", firstName: "Maria", lastName: "Clara", email: "maria@school.edu", gradeLevel: "7" },

    { id: "STU005", firstName: "Juan", lastName: "Dela Cruz", email: "juan@school.edu", gradeLevel: "7" },

    { id: "STU006", firstName: "Maria", lastName: "Clara", email: "maria@school.edu", gradeLevel: "7" },

    { id: "STU007", firstName: "Juan", lastName: "Dela Cruz", email: "juan@school.edu", gradeLevel: "7" },

    { id: "STU008", firstName: "Maria", lastName: "Clara", email: "maria@school.edu", gradeLevel: "7" },

    { id: "STU009", firstName: "Pedro", lastName: "Penduko", email: "pedro@school.edu", gradeLevel: "8" },

    { id: "STU0010", firstName: "Sisa", lastName: "Rizal", email: "sisa@school.edu", gradeLevel: "9" },

    { id: "STU0011", firstName: "Crisostomo", lastName: "Ibarra", email: "ibarra@school.edu", gradeLevel: "10" },

];

export default function CreateSubjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        subjectTitle: "",
        section: "",
        gradeLevel: "",
        adviserName: '',
        enrolledStudents: [] as typeof MOCK_STUDENTS, 
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "gradeLevel") {
            setFormData(prev => ({ ...prev, [name]: value, enrolledStudents: [] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Filter students for the search results
    const searchResults = useMemo(() => {
        if (!searchQuery || !formData.gradeLevel) return [];
        
        return MOCK_STUDENTS.filter(student => 
            student.gradeLevel === formData.gradeLevel &&
            (student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
             student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             student.id.includes(searchQuery)) &&
            !formData.enrolledStudents.some(es => es.id === student.id)
        );
    }, [searchQuery, formData.gradeLevel, formData.enrolledStudents]);

    const addStudent = (student: typeof MOCK_STUDENTS[0]) => {
        setFormData(prev => ({
            ...prev,
            enrolledStudents: [...prev.enrolledStudents, student]
        }));
        setSearchQuery(""); // Clear search after adding
    };

    const removeStudent = (id: string) => {
        setFormData(prev => ({
            ...prev,
            enrolledStudents: prev.enrolledStudents.filter(s => s.id !== id)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Subject created with " + formData.enrolledStudents.length + " students.");
            navigate(-1);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="text-indigo-600" size={24} />
                                Create New Subject
                            </h2>
                            <p className="text-sm text-gray-500">Search and add students to this class.</p>
                        </div>
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <BookOpen size={14} /> Subject Title
                                </label>
                                <input required type="text" name="subjectTitle" placeholder="e.g. Science 7" value={formData.subjectTitle} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <GraduationCap size={14} /> Grade Level
                                </label>
                                <select required name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                    <option value="">Select Grade</option>
                                    {[7, 8, 9, 10, 11, 12].map(num => <option key={num} value={num}>Grade {num}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users size={14} /> Section Name
                                </label>
                                <input required type="text" name="section" placeholder="e.g. Diamond" value={formData.section} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users size={14} /> Adviser Name
                                </label>
                                <input required type="text" name="adviserName" placeholder="e.g. Mr. John Doe" value={formData.adviserName} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        {/* Search and Selection Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Class List Management</h3>
                            
                            {/* Search Bar */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    disabled={!formData.gradeLevel}
                                    placeholder={formData.gradeLevel ? "Search student name or ID..." : "Select Grade Level first..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50"
                                />

                                {/* Search Results Dropdown */}
                                {searchQuery && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {searchResults.map(student => (
                                            <div 
                                                key={student.id}
                                                onClick={() => addStudent(student)}
                                                className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{student.lastName}, {student.firstName}</p>
                                                    <p className="text-xs text-gray-500">{student.id} • {student.email}</p>
                                                </div>
                                                <Plus size={16} className="text-indigo-600" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Enrolled Students Table/List */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Enrolled Students</span>
                                    <span className="text-xs font-bold text-indigo-600">{formData.enrolledStudents.length} Total</span>
                                </div>
                                <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                                    {formData.enrolledStudents.length > 0 ? (
                                        formData.enrolledStudents.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-3 bg-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{student.lastName}, {student.firstName}</p>
                                                        <p className="text-xs text-gray-500">{student.id}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeStudent(student.id)}
                                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm italic">
                                            No students added to the list yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex items-center gap-3">
                            <button type="button" onClick={() => navigate(-1)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                            <button type="submit" disabled={loading || !formData.gradeLevel} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300">
                                {loading ? "Creating..." : "Create Subject"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}