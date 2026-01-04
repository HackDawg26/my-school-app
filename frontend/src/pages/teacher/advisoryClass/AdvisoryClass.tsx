import React, { useState, type JSX } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {MOCK_STUDENTS}  from './mockStudentGrade.tsx';

// Define the shape of individual subject grades
interface SubjectGrade {
  subject: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

// Define the shape of a Student in the advisory class
interface AdvisoryStudent {
  id: string | number;
  name: string;
  grades: SubjectGrade[];
}

export default function Advisory(): JSX.Element {
  const navigate = useNavigate();
  // State can be string (ID), number (ID), or null (collapsed)
  const [expandedStudent, setExpandedStudent] = useState<string | number | null>(null);

  const toggleStudent = (id: string | number): void => {
    setExpandedStudent(expandedStudent === id ? null : id);
  };

  return (
    <div className="bg-gray-100 ">
      <div className="mx-auto p-1">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Grade 7 - Diamond</h1>
          <p className="text-gray-600">School Year 2024-2025</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-700 w-12"></th>
                <th className="p-4 font-semibold text-gray-700">Student Name</th>
                <th className="p-4 font-semibold text-gray-700 text-center">LRN</th>
                <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(MOCK_STUDENTS as AdvisoryStudent[]).map((student) => (
                <React.Fragment key={student.id}>
                  {/* Student Row */}
                  <tr 
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => toggleStudent(student.id)}
                  >
                    <td className="p-4 text-center">
                      {expandedStudent === student.id ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{student.name}</td>
                    <td className="p-4 text-center text-gray-600">{student.id}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          navigate(`SF9/${student.id}`);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                      >
                        <FileText size={16} className="mr-2" />
                        Generate SF9
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Grades Section */}
                  {expandedStudent === student.id && (
                    <tr>
                      <td colSpan={4} className="bg-gray-50 p-6">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-inner">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="p-2 pl-4 text-gray-700">Learning Area</th>
                                <th className="p-2 text-center text-gray-700">Q1</th>
                                <th className="p-2 text-center text-gray-700">Q2</th>
                                <th className="p-2 text-center text-gray-700">Q3</th>
                                <th className="p-2 text-center text-gray-700">Q4</th>
                                <th className="p-2 text-center font-bold text-gray-900">Final</th>
                              </tr>
                            </thead>
                            <tbody>
                              {student.grades.map((g, index) => {
                                const average = (g.q1 + g.q2 + g.q3 + g.q4) / 4;
                                return (
                                  <tr key={`${student.id}-grade-${index}`} className="border-b border-gray-100 last:border-0">
                                    <td className="p-2 pl-4 font-medium text-gray-800">{g.subject}</td>
                                    <td className="p-2 text-center text-gray-600">{g.q1}</td>
                                    <td className="p-2 text-center text-gray-600">{g.q2}</td>
                                    <td className="p-2 text-center text-gray-600">{g.q3}</td>
                                    <td className="p-2 text-center text-gray-600">{g.q4}</td>
                                    <td className="p-2 text-center font-bold text-blue-700">
                                      {average.toFixed(0)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}