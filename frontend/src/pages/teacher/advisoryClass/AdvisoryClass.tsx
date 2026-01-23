<<<<<<< HEAD
import React, { useState, type JSX } from 'react';

import { ChevronDown, ChevronRight, Download, FileText } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import {MOCK_STUDENTS}  from './mockStudentGrade.tsx';
=======
// Advisory.tsx (UPDATED — uses YOUR version + adds Quarterly Grades from backend)
//
// ✅ Uses your existing flow:
//   1) GET /api/teachers/{userId}/            -> TeacherDetail (advisory: Section object)
//   2) GET /api/sections/{sectionId}/students/-> students in that section
//
// ✅ Adds quarterly grades:
//   3) GET /api/students/{studentId}/quarterly-summary/ -> rows per SubjectOffering with q1–q4 + final
//
// Backend requirement:
// - Implement students/<id>/quarterly-summary/ (recommended) OR change the fetch below to your grades endpoint.
>>>>>>> Backup

import React, { useEffect, useMemo, useState, type JSX } from "react";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

// -------- Types --------

type AdvisorySection = {
  id: number;
  name: string;
  grade_level: string | number; // could be "GRADE_7" or 7
  adviser_name?: string;
};

type TeacherDetail = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  advisory: AdvisorySection | null;
};

type StudentRow = {
  id: number;
  school_id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade_level: string | number;
  section: number | null;
};

type QuarterlySummaryRow = {
  subject_offering_id: number;
  subject: string; // subject offering name
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  final: number | null;
};

// -------- Helpers --------

function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function gradeLabel(grade_level: string | number) {
  if (typeof grade_level === "string" && grade_level.startsWith("GRADE_")) {
    return grade_level.replace("GRADE_", "Grade ");
  }
  return `Grade ${grade_level}`;
}

function safeAvg(values: Array<number | null | undefined>) {
  const nums = values
    .map((v) => (typeof v === "number" ? v : null))
    .filter((v): v is number => v !== null && Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// -------- Component --------

export default function Advisory(): JSX.Element {
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  // grades cache per studentId
  const [gradesByStudent, setGradesByStudent] = useState<Record<number, QuarterlySummaryRow[]>>(
    {}
  );
  const [gradesLoadingByStudent, setGradesLoadingByStudent] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  const toggleStudent = (id: number) => {
    setExpandedStudent((prev) => (prev === id ? null : id));
  };

  // 1) Load teacher + 2) section students
  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const payload = parseJwt(token);
      const userId = payload?.user_id ?? payload?.id;

      if (!userId) {
        setErrorMsg("Cannot read user_id from token.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // 1) Teacher detail
        const teacherRes = await fetch(`${base}/teachers/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!teacherRes.ok) {
          const err = await teacherRes.json().catch(() => ({}));
          console.error("Teacher load failed:", err);
          setErrorMsg("Failed to load teacher profile.");
          setTeacher(null);
          setStudents([]);
          return;
        }

        const teacherData = (await teacherRes.json()) as TeacherDetail;
        setTeacher(teacherData);

        // 2) Students in advisory section
        const section = teacherData.advisory;
        if (!section?.id) {
          setStudents([]);
          return;
        }

        const studentsRes = await fetch(`${base}/sections/${section.id}/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!studentsRes.ok) {
          const err = await studentsRes.json().catch(() => ({}));
          console.error("Students load failed:", err);
          setErrorMsg("Failed to load advisory students.");
          setStudents([]);
          return;
        }

        const studentData = (await studentsRes.json()) as StudentRow[];
        setStudents(Array.isArray(studentData) ? studentData : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading advisory.");
        setTeacher(null);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  // 3) Load quarterly grades when a student expands (cached)
  useEffect(() => {
    const loadGrades = async (studentId: number) => {
      if (!token) return;
      if (gradesByStudent[studentId]) return; // already cached

      setGradesLoadingByStudent((prev) => ({ ...prev, [studentId]: true }));
      try {
        const res = await fetch(`${base}/students/${studentId}/quarterly-summary/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Quarterly summary load failed:", err);
          setGradesByStudent((prev) => ({ ...prev, [studentId]: [] }));
          return;
        }

        const data = (await res.json()) as QuarterlySummaryRow[];
        setGradesByStudent((prev) => ({ ...prev, [studentId]: Array.isArray(data) ? data : [] }));
      } catch (e) {
        console.error(e);
        setGradesByStudent((prev) => ({ ...prev, [studentId]: [] }));
      } finally {
        setGradesLoadingByStudent((prev) => ({ ...prev, [studentId]: false }));
      }
    };

    if (expandedStudent) loadGrades(expandedStudent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedStudent, token]);

  const header = useMemo(() => {
    const sec = teacher?.advisory;
    if (!sec) {
      return {
        title: "No Advisory Class Assigned",
        subtitle: `SY 2024-2025 • ${students.length} Students Enrolled`,
      };
    }
    return {
      title: `${gradeLabel(sec.grade_level)} - ${sec.name}`,
      subtitle: `SY 2024-2025 • ${students.length} Students Enrolled`,
    };
  }, [teacher, students.length]);

  if (loading) {
    return (
      <section className="bg-slate-50/50 min-h-screen p-6 lg:p-10 font-sans">
        <div className="max-w-7xl mx-auto text-slate-600 font-bold">Loading advisory…</div>
      </section>
    );
  }

  if (errorMsg) {
    return (
      <section className="bg-slate-50/50 min-h-screen p-6 lg:p-10 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900">Advisory</h1>
          <p className="text-rose-600 font-bold mt-2">{errorMsg}</p>
        </div>
      </section>
    );
  }

  return (

    <section className="bg-slate-50/50 min-h-screen p-6 lg:p-10 font-sans">
<<<<<<< HEAD
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

=======
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded">
                Advisory Class
              </span>
            </div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{header.title}</h1>
            <p className="text-slate-500 font-medium mt-1">{header.subtitle}</p>

            {teacher ? (
              <p className="text-slate-400 text-sm font-semibold mt-2">
                Adviser: {teacher.first_name} {teacher.last_name}
              </p>
            ) : null}
          </div>

          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={18} /> Export Masterlist
          </button>
        </header>

        {/* EMPTY */}
        {!teacher?.advisory ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-slate-600">
            This teacher has no advisory section assigned yet.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">
                    #
                  </th>
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Student Name
                  </th>
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                    LRN / ID
                  </th>
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                    Average
                  </th>
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const isExpanded = expandedStudent === student.id;
                  const fullName = `${student.first_name} ${student.last_name}`.trim();

                  const gradeRows = gradesByStudent[student.id] ?? [];
                  const finals = gradeRows.map((r) => r.final);
                  const overallAvg = safeAvg(finals);

                  return (
                    <React.Fragment key={student.id}>
                      <tr
                        className={`group transition-all cursor-pointer ${
                          isExpanded ? "bg-indigo-50/40" : "hover:bg-slate-50"
                        }`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <td className="p-5 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>

                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors border border-transparent group-hover:border-indigo-100">
                              {(fullName[0] || "?").toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base">{fullName}</span>
                              <span className="text-[11px] font-semibold text-slate-400">{student.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-5 text-center">
                          <span className="font-mono text-sm text-slate-400">{student.school_id}</span>
                        </td>

                        <td className="p-5 text-center">
                          <span className="text-sm font-black text-slate-700">
                            {overallAvg != null ? `${overallAvg.toFixed(1)}%` : "—"}
                          </span>
                        </td>

                        <td className="p-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`SF9/${student.id}`);
                            }}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                          >
                            Generate SF9
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-slate-50/30">
                            <div className="p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                {/* INSIGHTS COLUMN */}
                                <div className="lg:col-span-1 space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Performance Details
                                  </h4>

                                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Average</p>
                                    <p className="text-xl font-black text-slate-800">
                                      {overallAvg != null ? `${overallAvg.toFixed(1)}%` : "—"}
                                    </p>
                                  </div>

                                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Grades Source</p>
                                    <p className="text-sm font-black text-slate-800 tracking-tight">
                                      Quarterly Grades
                                    </p>
                                  </div>
                                </div>

                                {/* GRADE TABLE COLUMN */}
                                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                      <tr>
                                        <th className="p-4 pl-6 font-black text-[10px] uppercase tracking-wider text-left">
                                          Subject Offering
                                        </th>
                                        {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                                          <th
                                            key={q}
                                            className="p-4 font-black text-[10px] uppercase tracking-wider text-center"
                                          >
                                            {q}
                                          </th>
                                        ))}
                                        <th className="p-4 pr-6 font-black text-[10px] uppercase tracking-wider text-right">
                                          Final
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                      {gradesLoadingByStudent[student.id] ? (
                                        <tr>
                                          <td colSpan={6} className="p-6 text-slate-600 font-semibold">
                                            Loading grades…
                                          </td>
                                        </tr>
                                      ) : gradeRows.length === 0 ? (
                                        <tr>
                                          <td colSpan={6} className="p-6 text-slate-600 font-semibold">
                                            No quarterly grades available yet.
                                          </td>
                                        </tr>
                                      ) : (
                                        gradeRows.map((g) => (
                                          <tr key={g.subject_offering_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-slate-700">{g.subject}</td>

                                            {[g.q1, g.q2, g.q3, g.q4].map((score, i) => (
                                              <td
                                                key={i}
                                                className={`p-4 text-center font-medium ${
                                                  typeof score === "number" && score < 75
                                                    ? "text-rose-500"
                                                    : "text-slate-600"
                                                }`}
                                              >
                                                {typeof score === "number" ? score : "—"}
                                              </td>
                                            ))}

                                            <td className="p-4 pr-6 text-right">
                                              <span
                                                className={`font-black ${
                                                  typeof g.final === "number" && g.final < 75
                                                    ? "text-rose-600"
                                                    : "text-indigo-600"
                                                }`}
                                              >
                                                {typeof g.final === "number" ? g.final.toFixed(0) : "—"}
                                              </span>
                                            </td>
                                          </tr>
                                        ))
                                      )}
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

                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-slate-600">
                      No students found in this advisory section.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
>>>>>>> Backup
  );
}
