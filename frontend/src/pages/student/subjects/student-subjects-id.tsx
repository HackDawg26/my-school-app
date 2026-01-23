'use client';
<<<<<<< HEAD

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Link2, PlayCircle } from "lucide-react";

import { subjects, assignments, quizzes, resources } from "../../../components/lib/data";
import { TaskList } from "../../../components/components/task-list";

type Tab = "tasks" | "activities" | "resources";
=======

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Link2, PlayCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';

type SubjectOfferingDetail = {
  id: number;
  subject_name: string;                 // SubjectOffering name / subject name
  teacher_name?: string;        // if serializer provides
  average?: number; 
  final_grade?: number;            // optional
};

type Assignment = {
  id: number;
  title: string;
  due_date?: string | null;
  status?: 'PENDING' | 'SUBMITTED' | 'GRADED';
};

type QuizStatus = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED';
type Quiz = {
  id: number;
  title: string;
  status?: QuizStatus;
  open_time?: string | null;
  close_time?: string | null;
  time_limit?: number | null;
};

type Resource = {
  id: number;
  title: string;
  link?: string; // url
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}
>>>>>>> Backup

export default function StudentSubjectpage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<Tab>("tasks");

  const subject = useMemo(() => subjects.find((s) => s.id === id), [id]);

  useEffect(() => {
    if (!subject) navigate("/not-found");
  }, [subject, navigate]);

  if (!subject) return null;

  const subjectTasks = assignments.filter((a) => a.subjectId === subject.id);
  const subjectActivities = quizzes.filter((q) => q.subjectId === subject.id);
  const subjectResources = resources.filter((r) => r.subjectId === subject.id);

  return (
    <main className="p-1">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/student/subject"
=======
  const offeringId = Number(id || 0);
  const [activeTab, setActiveTab] = useState<'activities' | 'resources'>('activities');

  const [offering, setOffering] = useState<SubjectOfferingDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem('access');
  const base = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      if (!offeringId) {
        setErrorMsg('Invalid subject offering id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // 1) SubjectOffering detail (required)
const offeringRes = await fetch(`${base}/student/subject-offerings/${offeringId}/`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!offeringRes.ok) {
  const err = await offeringRes.json().catch(() => ({}));
  console.error("SubjectOffering load failed:", err);
  setErrorMsg("Subject offering not found.");
  setOffering(null);
  setAssignments([]);
  setQuizzes([]);
  setResources([]);
  return;
}

const offeringData = (await offeringRes.json()) as SubjectOfferingDetail;
setOffering(offeringData);

// 2) Optional endpoints (do not hard-fail if they don’t exist yet)
const [aRes, qRes, rRes] = await Promise.all([
  fetch(`${base}/student/subject-offerings/${offeringId}/assignments/`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null),
  fetch(`${base}/student/subject-offerings/${offeringId}/quizzes/`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null),
  fetch(`${base}/student/subject-offerings/${offeringId}/resources/`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null),
]);


        if (aRes && aRes.ok) {
          const data = (await aRes.json()) as Assignment[];
          setAssignments(Array.isArray(data) ? data : []);
        } else {
          setAssignments([]);
        }

        if (qRes && qRes.ok) {
          const data = (await qRes.json()) as Quiz[];
          setQuizzes(Array.isArray(data) ? data : []);
        } else {
          setQuizzes([]);
        }

        if (rRes && rRes.ok) {
          const data = (await rRes.json()) as Resource[];
          setResources(Array.isArray(data) ? data : []);
        } else {
          setResources([]);
        }
      } catch (e) {
        console.error(e);
        setErrorMsg('Network error while loading subject offering.');
        setOffering(null);
        setAssignments([]);
        setQuizzes([]);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [offeringId, token]);

  // --- Derived stats (safe even if backend lacks fields) ---
  const stats = useMemo(() => {
  // Current Grade (final grade)
  const grade =
    typeof offering?.final_grade === 'number'
      ? Math.round(offering.final_grade)
      : null;
  // ✅ Activity Count should come from quizzes
  const activityCount = quizzes.length;
  return { grade, activityCount };
}, [offering, assignments, quizzes]);

  // --- States ---
  if (loading) {
    return (
      <main className="p-6">
        <p className="text-slate-600 font-bold">Loading subject…</p>
      </main>
    );
  }

  if (errorMsg || !offering) {
    return (
      <main className="p-6">
        <button
          onClick={() => navigate('/student/subject')}
>>>>>>> Backup
          className="flex items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
<<<<<<< HEAD
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">
            {subject.teacher}
=======
        </button>
        <p className="text-rose-600 font-bold mt-4">{errorMsg ?? 'Not found'}</p>
      </main>
    );
  }

  return (
    <main className="p-1">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/student/subject"
          className="flex items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">{offering.subject_name}</h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
            {offering.teacher_name ?? '—'}
>>>>>>> Backup
          </p>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
<<<<<<< HEAD
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
            Current Grade
          </label>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">
              {subject.grade}
            </p>
=======
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Grade</label>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">{stats.grade ?? '—'}</p>
>>>>>>> Backup
            <span className="text-slate-400 font-bold">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">Official SF9 entry</p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
<<<<<<< HEAD
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
            Completion
          </label>
          <p className="text-5xl font-bold tracking-tighter mt-4 text-slate-900">
            {subject.progress}%
          </p>
          <div className="h-2.5 mt-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-out bg-slate-900"
              style={{ width: `${subject.progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
            Activity Count
          </label>
          <p className="text-5xl font-bold tracking-tighter mt-4 text-slate-900">
            {subjectTasks.length}
          </p>
          <p className="text-xs text-slate-500 mt-2 italic">Assignments & projects</p>
        </div>
      </div>

      {/* CUSTOM TAB NAV */}
      <div className="mb-6">
        <div className="flex gap-10 border-b border-slate-100 px-2">
          {(["tasks", "activities", "resources"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
=======
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Count</label>
          <p className="text-5xl font-bold tracking-tighter mt-4 text-slate-900">{stats.activityCount}</p>
          <p className="text-xs text-slate-500 mt-2 italic">Assignments & Quizzes</p>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6">
        <div className="flex gap-10 border-b border-slate-100 px-2">
          {(['activities', 'resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
>>>>>>> Backup
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

<<<<<<< HEAD
      {/* MAIN CONTENT */}
      <div className="rounded-[32px] border-2 border-slate-900 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 pb-6">
          <h2 className="text-4xl font-bold tracking-tighter text-slate-900 capitalize">
            {activeTab}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            {activeTab === "tasks" && `Review all submitted assignments for ${subject.name}.`}
            {activeTab === "activities" && `Take your scheduled quizzes and exams.`}
            {activeTab === "resources" && `Download learning modules and references.`}
=======
      {/* CONTENT */}
      <div className="rounded-[32px] border-2 border-slate-900 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 pb-6">
          <h2 className="text-4xl font-bold tracking-tighter text-slate-900 capitalize">{activeTab}</h2>
          <p className="text-slate-500 mt-2 font-medium">
            {activeTab === 'activities' && `Take your scheduled quizzes and exams.`}
            {activeTab === 'resources' && `Download learning modules and references.`}
>>>>>>> Backup
          </p>
        </div>

        <div className="p-10 pt-0">
<<<<<<< HEAD
          {activeTab === "tasks" && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <TaskList subjectTasks={subjectTasks} />
            </div>
          )}

          {activeTab === "activities" && (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <th className="pb-5">Activity Title</th>
                    <th className="pb-5">Type</th>
                    <th className="pb-5">Due Date</th>
                    <th className="pb-5">Limit</th>
                    <th className="pb-5">Status</th>
                    <th className="pb-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectActivities.map((activity, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-6 font-bold text-slate-900">{activity.title}</td>
                      <td className="py-6 text-sm text-slate-500 font-bold uppercase">
                        {activity.type || "Exam"}
                      </td>
                      <td className="py-6 text-sm text-slate-500">
                        {activity.dueDate ?? "—"}
                      </td>
                      <td className="py-6 text-sm text-slate-500">{activity.timeLimit ?? "—"}</td>
                      <td className="py-6">
                        <span className="bg-[#fee2e2] text-[#991b1b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase">
                          Not Taken
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 border-2 border-slate-900 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all"
                        >
                          <PlayCircle className="h-4 w-4" />
                          Start
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjectResources.map((res, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-slate-900 transition-all flex flex-col justify-between h-full group"
                >
                  <div className="flex gap-5 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Link2 className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900 leading-tight">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-tighter">
                        Module Reference
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 border-2 border-slate-900 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Open Link
                  </button>
                </div>
              ))}
=======
          {/* ACTIVITIES / QUIZZES */}
          {activeTab === 'activities' && (
            <div className="mt-8 overflow-x-auto border-t border-slate-100 pt-8">
              {quizzes.length === 0 ? (
                <div className="text-slate-600 font-semibold">No quizzes available yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-900">
                      <th className="pb-5">Activity Title</th>
                      <th className="pb-5">Type</th>
                      <th className="pb-5">Open</th>
                      <th className="pb-5">Close</th>
                      <th className="pb-5">Status</th>
                      <th className="pb-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizzes.map((q) => (
                      <tr key={q.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-6 font-bold text-slate-900">{q.title}</td>
                        <td className="py-6 text-sm text-slate-500 font-bold uppercase">Quiz</td>
                        <td className="py-6 text-sm text-slate-500">{formatDate(q.open_time)}</td>
                        <td className="py-6 text-sm text-slate-500">{formatDate(q.close_time)}</td>
                        <td className="py-6">
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase">
                            {q.status ?? '—'}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <button className="inline-flex items-center gap-2 border-2 border-slate-900 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all">
                            <PlayCircle className="h-4 w-4" />
                            Start
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* RESOURCES */}
          {activeTab === 'resources' && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-slate-100 pt-8">
              {resources.length === 0 ? (
                <div className="text-slate-600 font-semibold col-span-full">No resources available yet.</div>
              ) : (
                resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-slate-900 transition-all flex flex-col justify-between h-full group"
                  >
                    <div className="flex gap-5 mb-8">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Link2 className="h-6 w-6 text-slate-900" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-slate-900 leading-tight">{res.title}</h4>
                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-tighter">
                          Module Reference
                        </p>
                      </div>
                    </div>

                    {res.link ? (
                      <a
                        href={res.link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 border-2 border-slate-900 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                      >
                        <Download className="h-4 w-4" />
                        Open Link
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest text-slate-300 cursor-not-allowed"
                      >
                        <Download className="h-4 w-4" />
                        No Link
                      </button>
                    )}
                  </div>
                ))
              )}
>>>>>>> Backup
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
