import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ActivityData {
  label: string;
  submissions: number;
}

type GradingPeriod = "Q1" | "Q2" | "Q3" | "Q4";

type SubjectData = {
  [period in GradingPeriod]: ActivityData[];
};

type SubmissionData = {
  [subject: string]: SubjectData;
};

const submissionData: SubmissionData = {
  filipino: {
    Q1: [
      { label: "Quiz 1", submissions: 25 },
      { label: "Essay", submissions: 20 },
    ],
    Q2: [
      { label: "Quiz 2", submissions: 22 },
      { label: "Seatwork 1", submissions: 45 },
      { label: "Assignment 1", submissions: 32 },
      { label: "Oral Recitation", submissions: 44 },
      { label: "Quiz 3", submissions: 50 },
      { label: "exam", submissions: 33 },
    ],
    Q3: [
      { label: "Midterm Project", submissions: 26 },
    ],
    Q4: [
      { label: "Final Project", submissions: 28 },
    ],
  },
  english: {
    Q1: [
      { label: "Grammar Quiz", submissions: 28 },
    ],
    Q2: [
      { label: "Book Review", submissions: 24 },
    ],
    Q3: [
      { label: "Midterm Essay", submissions: 30 },
    ],
    Q4: [
      { label: "Final Essay", submissions: 26 },
    ],
  },
  math: {
    Q1: [
      { label: "Quiz 1", submissions: 30 },
    ],
    Q2: [
      { label: "Problem Set", submissions: 29 },
    ],
    Q3: [
      { label: "Midterm Exam", submissions: 27 },
    ],
    Q4: [
      { label: "Final Exam", submissions: 28 },
    ],
  },
  science: {
    Q1: [
      { label: "Lab Activity", submissions: 22 },
    ],
    Q2: [
      { label: "Quiz 1", submissions: 26 },
    ],
    Q3: [
      { label: "Research Project", submissions: 24 },
    ],
    Q4: [
      { label: "Final Lab", submissions: 23 },
    ],
  },
};

const exportCSV = (filename: string, rows: any[]) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]).join(",");
  const csvContent =
    headers +
    "\n" +
    rows.map((row) => Object.values(row).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



const gradingPeriods: GradingPeriod[] = ["Q1", "Q2", "Q3", "Q4"];

const SubmissionReport: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("filipino");
  const [gradingPeriod, setGradingPeriod] = useState<GradingPeriod>("Q1");
  const [viewMode, setViewMode] = useState<"single" | "combined">("single");

  /** SINGLE SUBJECT DATA */
  const subjectActivities =
    submissionData[selectedSubject][gradingPeriod];

  /** COMBINED DATA */
  const combinedActivities = Object.keys(submissionData).map((subject) => {
    const total = submissionData[subject][gradingPeriod].reduce(
      (sum, item) => sum + item.submissions,
      0
    );
    return {
      label: subject.toUpperCase(),
      submissions: total,
    };
  });

  const activityData =
    viewMode === "single" ? subjectActivities : combinedActivities;

  const data = {
    labels: activityData.map((item) => item.label),
    datasets: [
      {
        label: "Number of Submissions",
        data: activityData.map((item) => item.submissions),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
    ],
  };

  const exportCurrentCSV = () => {
    if (viewMode === "single") {
      exportCSV(
        `${selectedSubject}-${gradingPeriod}.csv`,
        subjectActivities.map((a) => ({
          Subject: selectedSubject,
          Period: gradingPeriod,
          Activity: a.label,
          Submissions: a.submissions,
        }))
      );
    } else {
      exportCSV(
        `combined-${gradingPeriod}.csv`,
        combinedActivities.map((a) => ({
          Subject: a.label,
          Period: gradingPeriod,
          TotalSubmissions: a.submissions,
        }))
      );
    }
  };

  return (
    <div className="space-y-3 p-1">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Submission Report
        </h1>
        <p className="text-sm text-slate-500">
          Track student submissions per subject and grading period
        </p>
      </div>

      {/* FILTER + ACTION CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Grading Period */}
          <select
            value={gradingPeriod}
            onChange={(e) => setGradingPeriod(e.target.value as GradingPeriod)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {gradingPeriods.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          {/* View Mode */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="single">Per Subject</option>
            <option value="combined">Combined Subjects</option>
          </select>

          {/* Subject Selector */}
          {viewMode === "single" && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(submissionData).map((s) => (
                <option key={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export */}
          <button
            onClick={exportCurrentCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total Submissions
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {activityData.reduce((sum, a) => sum + a.submissions, 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Activities
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {activityData.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-bold">
            View Mode
          </p>
          <p className="text-lg font-bold text-indigo-600 mt-2 capitalize">
            {viewMode === "single"
              ? selectedSubject
              : "Combined Subjects"}
          </p>
        </div>
      </div>

      {/* CHART CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text:
                  viewMode === "single"
                    ? `${selectedSubject.toUpperCase()} – ${gradingPeriod}`
                    : `Combined Subjects – ${gradingPeriod}`,
                font: { size: 16, weight: "bold" },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 5 },
              },
            },
          }}
        />
      </div>
    </div>
  );

};

export default SubmissionReport;
