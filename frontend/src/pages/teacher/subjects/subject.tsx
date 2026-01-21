<<<<<<< HEAD
import React from 'react';
<<<<<<< HEAD
import { BookOpen, Users, BarChart, AlertTriangle, Plus, type LucideIcon } from 'lucide-react';
=======
import { BookOpen, Users, BarChart, AlertTriangle, Plus, type LucideIcon, AlertCircle } from 'lucide-react';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
import { Link } from 'react-router-dom';
import { useSubjects } from './SubjectProvider';
=======
import React, { useEffect, useState } from "react";
import { BookOpen, Users, BarChart, Plus, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
>>>>>>> Backup

/* ---------- Types ---------- */

interface SubjectOffering {
  id: number;
  name: string;         // Subject name only
  section: string;
  grade: string;
  room_number: string;
  schedule: string;
  students: number;
  average: number;
  pendingTasks: number;
}

/* ---------- Component ---------- */

export default function SubjectListPage() {
  const [offerings, setOfferings] = useState<SubjectOffering[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  /* ---------- Fetch Subject Offerings ---------- */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/subject-offerings/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setOfferings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  /* ---------- Loading / Empty States ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Loading subject offerings...
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-500 text-lg">No subject offerings assigned yet</p>
        <Link
          to="/teacher/subject/create-subject"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Create Subject Offering
        </Link>
      </div>
    );
  }

  /* ---------- Computed Stats ---------- */
  const totalClasses = offerings.length;
  const totalStudents = offerings.reduce((sum, o) => sum + o.students, 0);

  /* ---------- Render ---------- */
  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 p-1 ">
      <header className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-700 mb-8">
=======
    <section className="bg-slate-50 min-h-screen p-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
>>>>>>> Backup
        <div>
          <h1 className="text-3xl font-black">Subject Offerings</h1>
          <p className="text-slate-500">
            Manage your assigned subject offerings
          </p>
        </div>

        <Link
          to="/teacher/subject/create-subject"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow"
        >
          <Plus size={18} />
          New Offering
        </Link>
      </header>

      {/* Summary */}
      <div className="mb-6 text-slate-600">
        <strong>{totalClasses}</strong> offerings •{" "}
        <strong>{totalStudents}</strong> students
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offerings.map((o) => (
          <Link
            key={o.id}
            to={`/teacher/subject/${o.id}`}
            className="bg-white border rounded-2xl p-4 hover:shadow-xl transition relative group"
          >
            {/* Title */}
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold">{o.name}</h3>
                <p className="text-sm text-slate-400 uppercase">
                  {o.grade} • Section {o.section}
                </p>
              </div>
              <BookOpen className="text-indigo-500" />
            </div>

            {/* Room & Schedule */}
            <div className="bg-slate-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-slate-400 uppercase">Room</span>
                <p className="font-semibold">{o.room_number}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Schedule</span>
                <p className="font-semibold">{o.schedule}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  Students
                </span>
                <strong>{o.students}</strong>
              </div>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <BarChart size={16} />
                  Average
                </span>
                <strong
                  className={o.average < 85 ? "text-rose-500" : "text-emerald-600"}
                >
                  {o.average}%
                </strong>
              </div>

              <div className="flex justify-between text-sm text-amber-700">
                <span className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  Pending
                </span>
                <strong>{o.pendingTasks}</strong>
              </div>
            </div>
          </Link>
<<<<<<< HEAD
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
=======
    <section className="bg-slate-50/50 min-h-screen p-1 text-slate-900">
      {/* Header: More balanced and airy */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1 border-b border-slate-200 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Subject Roster
          </h1>
          <p className="text-slate-500 font-sm mt-1">
            Manage your teaching load and monitor student performance metrics.
          </p>
        </div>
        <Link
          to="/teacher/subject/create-subject"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>New Subject</span>
        </Link>
      </header>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">All Sections</h2>
          <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
            {totalClasses}
          </span>
        </div>

        {/* Grid: Improved spacing and sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
          {subjects.map(({ id, subject, section, grade, room, nextClass, students, average, pendingTasks }) => (
            <Link
              to={`/teacher/subject/${id}`}
              key={id}
<<<<<<< HEAD
              className="block p-5 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:scale-[1.01] transition duration-300 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {subject} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Gr. {grade} - Sec. {section}</span>
                </h3>
              </div>
              
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Room: <span className="font-semibold">{room}</span></span>
                  <span className="font-medium">Next: <span className="font-semibold">{nextClass}</span></span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Users size={18} className="mr-2 text-blue-500" />
                  <span>{students} Students</span>
                </div>
                <div className={`flex items-center text-sm font-medium ${average < 85 ? 'text-red-500' : 'text-green-500'}`}>
                  <BarChart size={18} className="mr-2" />
                  <span>{average}% Class Avg.</span>
                </div>
                <div className="flex items-center text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle size={18} className="mr-2" />
                  <span>{pendingTasks} Needs Grading</span>
=======
              className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-3 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1.5"
            >
              {/* Top accent bar based on "Needs Grading" status */}
              {/* <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl ${pendingTasks > 5 ? 'bg-amber-400' : 'bg-indigo-500'}`} /> */}

              <div className="flex justify-between items-start mb-1">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 uppercase tracking-wide">
                    <span>Grade {grade}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Section {section}</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <BookOpen size={20} />
                </div>
              </div>

              {/* Schedule Info Block */}
              <div className="grid grid-cols-2 gap-4 p-2 bg-slate-50 rounded-xl mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room</span>
                  <span className="text-sm font-bold text-slate-700">{room}</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Class</span>
                  <span className="text-sm font-bold text-slate-700">{nextClass}</span>
                </div>
              </div>

              {/* Metrics List */}
              <div className="mt-auto space-y-2 px-2">
                <div className="flex items-center justify-between text-sm ">
                  <div className="flex items-center gap-2 font-semibold text-slate-600">
                    <Users size={18} className="text-blue-500" />
                    <span>Enrolled Students</span>
                  </div>
                  <span className="font-bold text-slate-900">{students}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-600">
                    <BarChart size={18} className={average < 85 ? 'text-rose-500' : 'text-emerald-500'} />
                    <span>Class Average</span>
                  </div>
                  <span className={`font-bold ${average < 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {average}%
                  </span>
                </div>

                <div className={`flex items-center justify-between text-sm rounded-lg ${pendingTasks > 0 ? 'bg-amber-50' : 'bg-transparent'}`}>
                  <div className="flex items-center gap-2 font-semibold text-amber-700">
                    <AlertCircle size={18} />
                    <span>Pending Grading</span>
                  </div>
                  <span className="font-bold text-amber-700">{pendingTasks}</span>
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
                </div>
              </div>
            </Link>
          ))}
        </div>
=======
        ))}
>>>>>>> Backup
      </div>
    </section>
  );
}
