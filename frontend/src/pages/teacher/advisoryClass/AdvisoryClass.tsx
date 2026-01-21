import React, { useState, type JSX } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
=======
import { ChevronDown, ChevronRight, Download, FileText } from 'lucide-react';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
import { ChevronDown, ChevronRight, Download, FileText } from 'lucide-react';
>>>>>>> Backup
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
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="bg-gray-100 ">
      <div className="mx-auto p-1">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Grade 7 - Diamond</h1>
          <p className="text-gray-600">School Year 2024-2025</p>
        </header>
=======
    <section className="bg-slate-50/50 min-h-screen p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
          {/* HEADER SECTION */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded">
                          Advisory Class
                      </span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Grade 7 - Diamond</h1>
                  <p className="text-slate-500 font-medium mt-1">SY 2024-2025 • {MOCK_STUDENTS.length} Students Enrolled</p>
              </div>
              
              <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                  <Download size={18} /> Export Masterlist
              </button>
          </header>
>>>>>>> Backup

          {/* STUDENT MASTER TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                      <tr className="bg-slate-50/50">
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">#</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Name</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">LRN / ID</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Average</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {MOCK_STUDENTS.map((student, idx) => {
                          const isExpanded = expandedStudent === student.id;

                          // SAFE MATH: Calculate overall average across all subjects
                          const overallAvg = student.grades.reduce((acc, g) => {
                              const qAvg = (Number(g.q1 || 0) + Number(g.q2 || 0) + Number(g.q3 || 0) + Number(g.q4 || 0)) / 4;
                              return acc + qAvg;
                          }, 0) / student.grades.length;

                          return (
                              <React.Fragment key={student.id}>
                                  {/* PRIMARY ROW */}
                                  <tr 
                                      className={`group transition-all cursor-pointer ${isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}
                                      onClick={() => toggleStudent(student.id)}
                                  >
                                      <td className="p-5 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                                      <td className="p-5">
                                          <div className="flex items-center gap-4">
                                              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors border border-transparent group-hover:border-indigo-100">
                                                  {student.name.charAt(0)}
                                              </div>
                                              <span className="font-bold text-slate-800 text-base">{student.name}</span>
                                          </div>
                                      </td>
                                      <td className="p-5 text-center">
                                          <span className="font-mono text-sm text-slate-400">{student.id}</span>
                                      </td>
                                      <td className="p-5">
                                          <div className="flex flex-col items-center gap-1">
                                              <span className={`text-sm font-black ${overallAvg >= 90 ? 'text-emerald-600' : overallAvg < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                                                  {overallAvg > 0 ? `${overallAvg.toFixed(1)}%` : '—'}
                                              </span>
                                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                  <div 
                                                      className={`h-full transition-all duration-500 ${overallAvg >= 90 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                      style={{ width: `${overallAvg}%` }} 
                                                  />
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-5 text-right">
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); navigate(`SF9/${student.id}`); }}
                                              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                          >
                                              Generate SF9
                                          </button>
                                      </td>
                                  </tr>

                                  {/* EXPANDED ANALYTICS SECTION */}
                                  {isExpanded && (
                                      <tr>
                                          <td colSpan={5} className="p-0 bg-slate-50/30">
                                              <div className="p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                                      
                                                      {/* INSIGHTS COLUMN */}
                                                      <div className="lg:col-span-1 space-y-4">
                                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Performance Details</h4>
                                                          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                                                              <div className="flex items-center gap-2">
                                                                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                  <p className="text-sm font-black text-slate-800 tracking-tight">Promoted</p>
                                                              </div>
                                                          </div>
                                                          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance</p>
                                                              <p className="text-xl font-black text-slate-800">100%</p>
                                                          </div>
                                                      </div>

                                                      {/* GRADE TABLE COLUMN */}
                                                      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                                                          <table className="w-full text-sm">
                                                              <thead className="bg-slate-50 text-slate-500">
                                                                  <tr>
                                                                      <th className="p-4 pl-6 font-black text-[10px] uppercase tracking-wider text-left">Learning Area</th>
                                                                      {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <th key={q} className="p-4 font-black text-[10px] uppercase tracking-wider text-center">{q}</th>)}
                                                                      <th className="p-4 pr-6 font-black text-[10px] uppercase tracking-wider text-right">Final</th>
                                                                  </tr>
                                                              </thead>
                                                              <tbody className="divide-y divide-slate-100">
                                                                  {student.grades.map((g, index) => {
                                                                      const q1 = Number(g.q1 || 0);
                                                                      const q2 = Number(g.q2 || 0);
                                                                      const q3 = Number(g.q3 || 0);
                                                                      const q4 = Number(g.q4 || 0);
                                                                      const final = (q1 + q2 + q3 + q4) / 4;

                                                                      return (
                                                                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                                              <td className="p-4 pl-6 font-bold text-slate-700">{g.subject}</td>
                                                                              {[q1, q2, q3, q4].map((score, i) => (
                                                                                  <td key={i} className={`p-4 text-center font-medium ${score > 0 && score < 75 ? 'text-rose-500' : 'text-slate-600'}`}>
                                                                                      {score > 0 ? score : '—'}
                                                                                  </td>
                                                                              ))}
                                                                              <td className="p-4 pr-6 text-right">
                                                                                  <span className={`font-black ${final > 0 && final < 75 ? 'text-rose-600' : 'text-indigo-600'}`}>
                                                                                      {final > 0 ? final.toFixed(0) : '—'}
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                      );
                                                                  })}
                                                              </tbody>
                                                          </table>
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                              </React.Fragment>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
<<<<<<< HEAD
    </div>
=======
    <section className="bg-slate-50/50 min-h-screen p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
          {/* HEADER SECTION */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded">
                          Advisory Class
                      </span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Grade 7 - Diamond</h1>
                  <p className="text-slate-500 font-medium mt-1">SY 2024-2025 • {MOCK_STUDENTS.length} Students Enrolled</p>
              </div>
              
              <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                  <Download size={18} /> Export Masterlist
              </button>
          </header>

          {/* STUDENT MASTER TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                      <tr className="bg-slate-50/50">
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">#</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Name</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">LRN / ID</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Average</th>
                          <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {MOCK_STUDENTS.map((student, idx) => {
                          const isExpanded = expandedStudent === student.id;

                          // SAFE MATH: Calculate overall average across all subjects
                          const overallAvg = student.grades.reduce((acc, g) => {
                              const qAvg = (Number(g.q1 || 0) + Number(g.q2 || 0) + Number(g.q3 || 0) + Number(g.q4 || 0)) / 4;
                              return acc + qAvg;
                          }, 0) / student.grades.length;

                          return (
                              <React.Fragment key={student.id}>
                                  {/* PRIMARY ROW */}
                                  <tr 
                                      className={`group transition-all cursor-pointer ${isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}
                                      onClick={() => toggleStudent(student.id)}
                                  >
                                      <td className="p-5 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                                      <td className="p-5">
                                          <div className="flex items-center gap-4">
                                              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors border border-transparent group-hover:border-indigo-100">
                                                  {student.name.charAt(0)}
                                              </div>
                                              <span className="font-bold text-slate-800 text-base">{student.name}</span>
                                          </div>
                                      </td>
                                      <td className="p-5 text-center">
                                          <span className="font-mono text-sm text-slate-400">{student.id}</span>
                                      </td>
                                      <td className="p-5">
                                          <div className="flex flex-col items-center gap-1">
                                              <span className={`text-sm font-black ${overallAvg >= 90 ? 'text-emerald-600' : overallAvg < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                                                  {overallAvg > 0 ? `${overallAvg.toFixed(1)}%` : '—'}
                                              </span>
                                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                  <div 
                                                      className={`h-full transition-all duration-500 ${overallAvg >= 90 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                      style={{ width: `${overallAvg}%` }} 
                                                  />
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-5 text-right">
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); navigate(`SF9/${student.id}`); }}
                                              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                          >
                                              Generate SF9
                                          </button>
                                      </td>
                                  </tr>

                                  {/* EXPANDED ANALYTICS SECTION */}
                                  {isExpanded && (
                                      <tr>
                                          <td colSpan={5} className="p-0 bg-slate-50/30">
                                              <div className="p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                                      
                                                      {/* INSIGHTS COLUMN */}
                                                      <div className="lg:col-span-1 space-y-4">
                                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Performance Details</h4>
                                                          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                                                              <div className="flex items-center gap-2">
                                                                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                  <p className="text-sm font-black text-slate-800 tracking-tight">Promoted</p>
                                                              </div>
                                                          </div>
                                                          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance</p>
                                                              <p className="text-xl font-black text-slate-800">100%</p>
                                                          </div>
                                                      </div>

                                                      {/* GRADE TABLE COLUMN */}
                                                      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                                                          <table className="w-full text-sm">
                                                              <thead className="bg-slate-50 text-slate-500">
                                                                  <tr>
                                                                      <th className="p-4 pl-6 font-black text-[10px] uppercase tracking-wider text-left">Learning Area</th>
                                                                      {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <th key={q} className="p-4 font-black text-[10px] uppercase tracking-wider text-center">{q}</th>)}
                                                                      <th className="p-4 pr-6 font-black text-[10px] uppercase tracking-wider text-right">Final</th>
                                                                  </tr>
                                                              </thead>
                                                              <tbody className="divide-y divide-slate-100">
                                                                  {student.grades.map((g, index) => {
                                                                      const q1 = Number(g.q1 || 0);
                                                                      const q2 = Number(g.q2 || 0);
                                                                      const q3 = Number(g.q3 || 0);
                                                                      const q4 = Number(g.q4 || 0);
                                                                      const final = (q1 + q2 + q3 + q4) / 4;

                                                                      return (
                                                                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                                              <td className="p-4 pl-6 font-bold text-slate-700">{g.subject}</td>
                                                                              {[q1, q2, q3, q4].map((score, i) => (
                                                                                  <td key={i} className={`p-4 text-center font-medium ${score > 0 && score < 75 ? 'text-rose-500' : 'text-slate-600'}`}>
                                                                                      {score > 0 ? score : '—'}
                                                                                  </td>
                                                                              ))}
                                                                              <td className="p-4 pr-6 text-right">
                                                                                  <span className={`font-black ${final > 0 && final < 75 ? 'text-rose-600' : 'text-indigo-600'}`}>
                                                                                      {final > 0 ? final.toFixed(0) : '—'}
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                      );
                                                                  })}
                                                              </tbody>
                                                          </table>
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                              </React.Fragment>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
  </section>
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
=======
  </section>
>>>>>>> Backup
  );
}