import { Link } from "react-router-dom";
import React, { useState, type ChangeEvent, type FormEvent } from 'react';

// --- Interfaces ---

interface SubjectFormData {
  name: string;
  grade: string;
  section: string;
  roomNumber: string;
  schedule: string;
}



// --- Component ---

function SubjectCreationForm({ onSave }: any) {
  // 1. Initialize typed state
  const [subjectData, setSubjectData] = useState<SubjectFormData>({
    name: '',
    grade: '',
    section: '',
    roomNumber: '',
    schedule: '',
  });

  // 2. Typed handle changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubjectData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 3. Typed submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    if (onSave) {
        onSave(subjectData);
    }
    
    // Reset form fields
    setSubjectData({
        name: '',
        grade: '',
        section: '',
        roomNumber: '',
        schedule: '',
    });
  };

  const inputClasses = 
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white";
  
  const labelClasses = 
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
            New Subject
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Subject Name */}
          <div>
            <label htmlFor="name" className={labelClasses}>Subject Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={subjectData.name}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="e.g., Calculus I"
            />
          </div>

          {/* Grid for Grade and Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="grade" className={labelClasses}>Grade Level:</label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={subjectData.grade}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g., 12"
              />
            </div>
            
            <div>
              <label htmlFor="section" className={labelClasses}>Section:</label>
              <input
                type="text"
                id="section"
                name="section"
                value={subjectData.section}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g., Jupiter"
              />
            </div>
          </div>

          {/* Room Number */}
          <div>
            <label htmlFor="roomNumber" className={labelClasses}>Room #:</label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={subjectData.roomNumber}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="e.g., B-301"
            />
          </div>

          {/* Schedule */}
          <div>
            <label htmlFor="schedule" className={labelClasses}>Schedule (Days & Time):</label>
            <input
              type="text"
              id="schedule"
              name="schedule"
              value={subjectData.schedule}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="e.g., T/Th 1:00 PM - 2:30 PM"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg 
                       focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out shadow-lg"
          >
            Create Subject
          </button>
          
          {/* Cancel Link */}
          <Link 
            to="/teacher/subject" 
            className="w-full text-center block text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition duration-150 mt-2 font-medium"
          >
            Cancel and Go Back
          </Link>
          
        </form>
      </div>
    </div>
  );
}

export default SubjectCreationForm;