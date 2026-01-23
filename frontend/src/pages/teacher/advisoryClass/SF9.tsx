<<<<<<< HEAD

import React, { useState, type JSX } from "react";
=======
// ExportReportCardPDF.tsx (UPDATED — uses QUARTERLY GRADES from backend)
//
// ✅ Replaces hardcoded learningAreasBody with backend data from:
//    GET /api/students/:studentId/quarterly-summary/
//
// Optional (but recommended) for cover page fields:
//    GET /api/students/:studentId/   -> name, sex, age (or birthdate), grade_level, section, school_id/LRN
//
// NOTE: I kept CORE_VALUES as static (AO). If you have a backend for values, we can plug it in too.

import React, { useEffect, useMemo, useState, type JSX } from "react";
>>>>>>> Backup
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import deped_logo from "../../../assets/deped_logo.png";

// ---------------- Types ----------------

type QuarterlySummaryRow = {
  subject_offering_id: number;
  subject: string; // e.g. "Mathematics 7" (SubjectOffering title/name)
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  final: number | null; // you can compute backend-side or we compute fallback
};

type StudentDetail = {
  id: number;
  school_id: string; // LRN/ID
  first_name: string;
  last_name: string;
  email?: string;
  sex?: string; // "Male"/"Female"
  age?: number; // if you store it
  grade_level?: string | number;
  section_name?: string;
  section?: number | null;
};

// Extension type for jsPDF to support autoTable properties
type jsPDFCustom = jsPDF & {
  lastAutoTable: {
    finalY: number;
  };
};

// ---------------- Constants ----------------

const CORE_VALUES_DATA = [
  {
    value: "1. Maka-Diyos",
    statements: [
      "Expresses one's spiritual beliefs while respecting the spiritual beliefs of others",
      "Shows adherence to ethical principles by upholding truth",
    ],
  },
  {
    value: "2. Makatao",
    statements: ["Is sensitive to individual, social, and cultural differences", "Demonstrates contributions toward solidarity"],
  },
  {
    value: "3. Makakalikasan",
    statements: ["Cares for the environment and utilizes resources wisely, judiciously, and economically"],
  },
  {
    value: "4. Makabansa",
    statements: [
      "Demonstrates pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen",
      "Demonstrates appropriate behavior in carrying out activities in the school, community, and country",
    ],
  },
];

const MONTHS = ["", "AUG", "SEPT", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JULY"];

// ---------------- Helpers ----------------

function safeNum(n: any): number | null {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function computeFinal(q1: number | null, q2: number | null, q3: number | null, q4: number | null): number | null {
  const nums = [q1, q2, q3, q4].filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function remarkFromFinal(final: number | null) {
  if (final == null) return "";
  return final >= 75 ? "Passed" : "Failed";
}

function gradeLabel(grade_level: string | number | undefined) {
  if (!grade_level) return "";
  if (typeof grade_level === "string" && grade_level.startsWith("GRADE_")) return grade_level.replace("GRADE_", "Grade ");
  return `Grade ${grade_level}`;
}

// ---------------- Component ----------------

export default function ExportReportCardPDF(): JSX.Element {
<<<<<<< HEAD
    const navigate = useNavigate();

    
    // Add a state to toggle the preview if you want, or just show it by default
    const [showPreview, setShowPreview] = useState(true);
    const [activePage, setActivePage] = useState(1);


    // Replicating your JSX Image Helper with Types
    const getBase64ImageFromURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/png"));
                } else {
                    reject(new Error("Canvas context failed"));
                }
            };
            img.onerror = (error) => reject(error);
            img.src = url;
=======
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  const [showPreview, setShowPreview] = useState(true);
  const [activePage, setActivePage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [quarterly, setQuarterly] = useState<QuarterlySummaryRow[]>([]);

  const token = localStorage.getItem("access");
  const base = "http://127.0.0.1:8000/api";

  // Replicating your JSX Image Helper with Types
  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const coreValuesBody: any[][] = CORE_VALUES_DATA.flatMap((item) => {
    const numStatements = item.statements.length;
    const quarterCells = ["AO", "AO", "AO", "AO"]; // default marking; replace if you have backend data

    if (numStatements === 1) return [[item.value, item.statements[0], ...quarterCells]];

    const rows: any[][] = [];
    rows.push([
      { content: item.value, rowSpan: numStatements, styles: { valign: "middle" } },
      item.statements[0],
      ...quarterCells,
    ]);

    for (let i = 1; i < numStatements; i++) rows.push([item.statements[i], ...quarterCells]);
    return rows;
  });

  // Load student + quarterly grades
  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMsg("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }
      const sid = Number(studentId);
      if (!sid) {
        setErrorMsg("Invalid student id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // student detail (optional but helps cover)
        const studentRes = await fetch(`${base}/students/${sid}/`, {
          headers: { Authorization: `Bearer ${token}` },
>>>>>>> Backup
        });

        if (studentRes.ok) {
          const studentData = (await studentRes.json()) as StudentDetail;
          setStudent(studentData);
        } else {
          // don’t hard fail if you don’t have this endpoint, but log it
          const err = await studentRes.json().catch(() => ({}));
          console.warn("Student detail endpoint not available:", err);
          setStudent(null);
        }

        // quarterly summary (required for grades table)
        const qRes = await fetch(`${base}/students/${sid}/quarterly-summary/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!qRes.ok) {
          const err = await qRes.json().catch(() => ({}));
          console.error("Quarterly summary failed:", err);
          setErrorMsg("Failed to load quarterly grades for this student.");
          setQuarterly([]);
          return;
        }

        const qData = (await qRes.json()) as QuarterlySummaryRow[];
        setQuarterly(Array.isArray(qData) ? qData : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error while loading SF9 data.");
        setStudent(null);
        setQuarterly([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [studentId, token]);

  // Build rows for PDF + preview
  const learningRows = useMemo(() => {
    // normalize finals just in case backend didn’t compute
    return quarterly.map((r) => {
      const q1 = safeNum(r.q1);
      const q2 = safeNum(r.q2);
      const q3 = safeNum(r.q3);
      const q4 = safeNum(r.q4);
      const final = safeNum(r.final) ?? computeFinal(q1, q2, q3, q4);

      return {
        subject: r.subject,
        q1,
        q2,
        q3,
        q4,
        final,
        remarks: remarkFromFinal(final),
      };
    });
  }, [quarterly]);

  const generalAverage = useMemo(() => {
    const finals = learningRows
      .map((r) => r.final)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (finals.length === 0) return null;
    return finals.reduce((a, b) => a + b, 0) / finals.length;
  }, [learningRows]);

  const handleExport = async (): Promise<void> => {
    // If no data, stop
    if (learningRows.length === 0) {
      alert("No quarterly grades found. Please add grades first.");
      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    }) as jsPDFCustom;

    // 1) Build Learning Areas body from quarterly grades
    const learningAreasBody: any[] = learningRows.map((r) => [
      r.subject,
      r.q1 != null ? String(Math.round(r.q1)) : "",
      r.q2 != null ? String(Math.round(r.q2)) : "",
      r.q3 != null ? String(Math.round(r.q3)) : "",
      r.q4 != null ? String(Math.round(r.q4)) : "",
      r.final != null ? String(Math.round(r.final)) : "",
      r.remarks,
    ]);

    // General Average row
    const genAvg = generalAverage != null ? Math.round(generalAverage) : null;
    learningAreasBody.push([
      { content: "General Average", colSpan: 5, styles: { halign: "right", fontStyle: "bold", valign: "middle" } } as any,
      genAvg != null ? String(genAvg) : "",
      genAvg != null ? (genAvg >= 75 ? "Passed" : "Failed") : "",
    ]);

    // 2) PAGE 1
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("REPORT ON LEARNING PROGRESS", 72, 40);
    pdf.text("AND ACHIEVEMENT", 144, 56);

    autoTable(pdf, {
      startY: 64,
      head: [
        [
          { content: "LEARNING AREAS", rowSpan: 2, styles: { halign: "justify", valign: "middle", fontSize: 12 } },
          { content: "QUARTER", colSpan: 4, styles: { halign: "center", fontSize: 11 } },
          { content: "FINAL GRADE", rowSpan: 2, styles: { halign: "center", valign: "middle", fontSize: 12 } },
          { content: "REMARKS", rowSpan: 2, styles: { halign: "justify", valign: "middle", fontSize: 12 } },
        ],
        ["1", "2", "3", "4"],
      ],
      body: learningAreasBody,
      theme: "grid",
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold" },
      styles: { fontSize: 10, textColor: 0, valign: "middle", lineWidth: 0.5, lineColor: [0, 0, 0] },
      tableWidth: 350,
    });

    const finalYLeft = pdf.lastAutoTable.finalY;

    pdf.setFontSize(16);
    pdf.text(`REPORT ON LEARNER'S OBSERVED VALUES`, 430, 40);

    autoTable(pdf, {
      startY: 64,
      margin: { left: 420 },
      head: [
        [
          { content: "Core Values", rowSpan: 2, styles: { halign: "center", fontSize: 12, cellWidth: 96 } },
          { content: "Behavior Statement", rowSpan: 2, styles: { halign: "center", fontSize: 12 } },
          { content: "Quarter", colSpan: 4, styles: { halign: "center", fontSize: 11 } },
        ],
        ["1", "2", "3", "4"],
      ],
      body: coreValuesBody,
      theme: "grid",
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold" },
      styles: { textColor: 0, fontSize: 10, valign: "middle", lineWidth: 0.5, lineColor: [0, 0, 0] },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "justify", cellPadding: 9 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "center", cellWidth: 20 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 20 },
      },
      tableWidth: 380,
    });

    autoTable(pdf, {
      startY: finalYLeft + 15,
      margin: { left: 50 },
      head: [[{ content: "Descriptors" }, { content: "Grading Scale" }, { content: "Remarks" }]],
      body: [
        ["Outstanding Performance", "90-100 Excellent", "Passed"],
        ["Very Satisfactory", "85-89 Very Good", "Passed"],
        ["Satisfactory", "80-84 Good", "Passed"],
        ["Fairly Satisfactory", "75-79 Fair", "Passed"],
        ["Did Not Meet Expectations", "Below 75", "Failed"],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "left" }, 2: { halign: "left" } },
      tableWidth: 350,
    });

    autoTable(pdf, {
      startY: 447,
      margin: { left: 430 },
      head: [[{ content: "Marking" }, { content: " Non-Numerical Rating" }]],
      body: [
        ["AO", "Always Observed"],
        ["SO", "Sometimes Observed"],
        ["RO", "Rarely Observed"],
        ["NO", "Not Observed"],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { halign: "center" }, 1: { halign: "left" } },
    });

    // PAGE 2 (unchanged layout, but fill name/grade/section/lrn if available)
    pdf.addPage();
    const pageWidth = pdf.internal.pageSize.width;
    const centerX = pageWidth / 2;
    const rightColX = centerX + 40;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Attendance Record", 150, 60, { align: "center" });

    autoTable(pdf, {
      startY: 70,
      margin: { left: 40 },
      tableWidth: 340,
      head: [MONTHS],
      body: [
        ["No. of School Days", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["No. of Days Present", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["No. of Times Absent", "", "", "", "", "", "", "", "", "", "", "", ""],
      ],
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 3, halign: "center" },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.5 },
      columnStyles: { 0: { halign: "left", cellWidth: 70, fontStyle: "bold" } },
    });

    const sigY = pdf.lastAutoTable.finalY + 40;
    pdf.setFontSize(11);
    pdf.text("PARENT/GUARDIAN'S SIGNATURE", 150, sigY, { align: "center" });

    const quarters = ["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"];
    quarters.forEach((q, i) => {
      const yPos = sigY + 30 + i * 30;
      pdf.setFont("helvetica", "normal");
      pdf.text(q, 60, yPos);
      pdf.line(130, yPos, 350, yPos);
    });

    try {
      const imgData = await getBase64ImageFromURL(deped_logo);
      pdf.addImage(imgData, "PNG", rightColX + 15, 50, 40, 40);
    } catch (e) {
      console.error("Logo failed to load", e);
    }

    pdf.setFontSize(8);
    pdf.text("Sf 9 - ES", rightColX, 40);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Republic of the Philippines", centerX + 200, 65, { align: "center" });
    pdf.text("DEPARTMENT OF EDUCATION", centerX + 200, 78, { align: "center" });

    pdf.setFont("helvetica", "normal");
    const schoolInfoY = 105;
    ["Region", "Division", "District", "School"].forEach((label, i) => {
      pdf.text(`${label}: __________________________________________`, rightColX, schoolInfoY + i * 18);
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("LEARNER'S PROGRESS REPORT CARD", centerX + 200, 190, { align: "center" });
    pdf.setFontSize(10);
    pdf.text("School Year: 2025-2026", centerX + 200, 205, { align: "center" });

    const fullName = student ? `${student.first_name} ${student.last_name}` : "";
    const grade = student?.grade_level ? String(student.grade_level) : "";
    const sectionName = student?.section_name ? String(student.section_name) : "";
    const lrn = student?.school_id ?? "";

    pdf.setFont("helvetica", "normal");
    pdf.text(`Name: ${fullName || "____________________________________________________"}`, rightColX, 230);
    pdf.text(`Age: ${student?.age ?? "___________"}`, rightColX, 250);
    pdf.text(`Sex: ${student?.sex ?? "___________"}`, centerX + 220, 250);
    pdf.text(`Grade: ${grade || "________"}`, rightColX, 270);
    pdf.text(`Section: ${sectionName || "_______"}`, centerX + 180, 270);
    pdf.text(`LRN: ${lrn || "___________"}`, centerX + 280, 270);

    pdf.setFontSize(9);
    const message =
      "Dear Parent, \n\nThis report card shows the ability and the progress your child has made in the different learning areas as well as his/her progress in core values.\n\nThe school welcomes you should you desire to know more about your child's progress.";
    pdf.text(message, rightColX, 300, { maxWidth: 350, align: "justify" });

    pdf.line(rightColX + 200, 380, rightColX + 340, 380);
    pdf.text("Teacher", rightColX + 270, 390, { align: "center" });

    pdf.line(rightColX, 410, rightColX + 150, 410);
    pdf.text("Head Teacher / Principal", rightColX + 75, 420, { align: "center" });

    pdf.setFont("helvetica", "bold");
    pdf.text("Certificate of Transfer", centerX + 200, 450, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Admitted to Grade: ________ Section: ________ Room: ________", rightColX, 470);
    pdf.text("Eligible for Admission to Grade: _____________________________", rightColX, 485);

    pdf.text("Approved:", rightColX, 505);
    pdf.line(rightColX, 530, rightColX + 140, 530);
    pdf.text("Head Teacher / Principal", rightColX + 70, 540, { align: "center" });

    pdf.line(rightColX + 200, 530, rightColX + 340, 530);
    pdf.text("Teacher", rightColX + 270, 540, { align: "center" });

    pdf.save(`SF9_${student?.school_id ?? "student"}_${student?.last_name ?? ""}.pdf`);
  };

  if (loading) {
    return (
<<<<<<< HEAD

        <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Navigation Group */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/teacher/advisory-class')}
                        className="group flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-sm"
                    >
                        <div className="p-2 bg-slate-50 group-hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                        <span>Back to Masterlist</span>
                    </button>
                </div>
=======
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-slate-600 font-bold">Loading quarterly grades…</p>
      </div>
    );
  }
>>>>>>> Backup

  if (errorMsg) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-rose-600 font-bold">{errorMsg}</p>
      </div>
    );
  }

  // -------- UI (your original layout, preview table now uses learningRows) --------

  return (
    <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/teacher/advisory-class")}
            className="group flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-sm"
          >
            <div className="p-2 bg-slate-50 group-hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span>Back to Masterlist</span>
          </button>
        </div>

<<<<<<< HEAD

            {/* Informational Footer */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <div className="p-1 bg-indigo-100 text-indigo-600 rounded-lg"><ShieldCheck size={16} /></div>
                <div className="flex-1">
                    <p className="text-[11px] font-black text-indigo-900 uppercase tracking-tight mb-0.5">Standard Compliance Check</p>
                    <p className="text-xs text-indigo-700/70 font-medium">Verified DepEd SF9-2024 Standards. <button onClick={() => setShowPreview(!showPreview)} className="ml-1 font-bold underline cursor-pointer">{showPreview ? "Hide Preview" : "Show Preview"}</button></p>
                </div>
                {showPreview && (
                    <div className="flex bg-white p-1 rounded-xl border border-indigo-100 shadow-sm">
                        <button onClick={() => setActivePage(1)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activePage === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'}`}>Page 1</button>
                        <button onClick={() => setActivePage(2)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activePage === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'}`}>Page 2</button>
                    </div>
                )}
=======
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="relative flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200 active:translate-y-0"
          >
            <FileText size={18} className="opacity-70" />
            Export Report Card (SF9)
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
        <div className="p-1 bg-indigo-100 text-indigo-600 rounded-lg">
          <ShieldCheck size={16} />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-black text-indigo-900 uppercase tracking-tight mb-0.5">
            Standard Compliance Check
          </p>
          <p className="text-xs text-indigo-700/70 font-medium">
            Verified DepEd SF9-2024 Standards.{" "}
            <button onClick={() => setShowPreview(!showPreview)} className="ml-1 font-bold underline cursor-pointer">
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </p>
        </div>
        {showPreview && (
          <div className="flex bg-white p-1 rounded-xl border border-indigo-100 shadow-sm">
            <button
              onClick={() => setActivePage(1)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                activePage === 1 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-600"
              }`}
            >
              Page 1
            </button>
            <button
              onClick={() => setActivePage(2)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                activePage === 2 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-600"
              }`}
            >
              Page 2
            </button>
          </div>
        )}
      </div>

      {showPreview && (
        <div className="mt-6 border-t border-slate-200 pt-8 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Live SF9 Preview</h3>
              <p className="text-[10px] text-slate-500 font-medium">Draft generated from backend quarterly grades</p>
>>>>>>> Backup
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActivePage(1)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  activePage === 1 ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                }`}
              >
                Page 1: Grades & Values
              </button>
              <button
                onClick={() => setActivePage(2)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  activePage === 2 ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                }`}
              >
                Page 2: Attendance & Cover
              </button>
            </div>
          </div>

          <div className="bg-slate-200/50 rounded-3xl p-10 overflow-hidden flex justify-center border border-slate-200">
            <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[1122px] min-w-[1122px] h-[794px] p-12 origin-top transform scale-[0.55] md:scale-[0.75] lg:scale-[0.85] xl:scale-100 my-[-15%] xl:my-0 text-black font-sans">
              {activePage === 1 ? (
                <div className="grid grid-cols-2 gap-12 h-full">
                  {/* LEFT: LEARNING PROGRESS */}
                  <div className="border-r border-slate-100 pr-12">
                    <div className="text-center mb-6">
                      <h1 className="text-lg font-bold">REPORT ON LEARNING PROGRESS</h1>
                      <h1 className="text-lg font-bold">AND ACHIEVEMENT</h1>
                    </div>

                    <table className="w-full border-[1.5px] border-black text-[11px] border-collapse">
                      <thead>
                        <tr className="font-bold">
                          <th className="border border-black p-2 text-center" rowSpan={2}>
                            LEARNING AREAS
                          </th>
                          <th className="border border-black p-1 text-center" colSpan={4}>
                            QUARTER
                          </th>
                          <th className="border border-black p-1 text-center" rowSpan={2}>
                            FINAL GRADE
                          </th>
                          <th className="border border-black p-1 text-center" rowSpan={2}>
                            REMARKS
                          </th>
                        </tr>
                        <tr className="font-bold text-center">
                          {["1", "2", "3", "4"].map((q) => (
                            <th key={q} className="border border-black p-1 w-10">
                              {q}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {learningRows.map((r, i) => (
                          <tr key={i} className={r.remarks === "Failed" ? "bg-red-50" : ""}>
                            <td className="border border-black p-2 font-medium">{r.subject}</td>
                            <td className="border border-black p-1 text-center">{r.q1 ?? ""}</td>
                            <td className="border border-black p-1 text-center">{r.q2 ?? ""}</td>
                            <td className="border border-black p-1 text-center">{r.q3 ?? ""}</td>
                            <td className="border border-black p-1 text-center">{r.q4 ?? ""}</td>
                            <td className="border border-black p-1 text-center font-bold">
                              {r.final != null ? Math.round(r.final) : ""}
                            </td>
                            <td
                              className={`border border-black p-1 text-center text-[10px] font-bold uppercase ${
                                r.remarks === "Passed" ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              {r.remarks}
                            </td>
                          </tr>
                        ))}

                        <tr className="font-bold bg-slate-50">
                          <td className="border border-black p-2 text-right" colSpan={5}>
                            General Average
                          </td>
                          <td className="border border-black p-1 text-center underline">
                            {generalAverage != null ? Math.round(generalAverage) : ""}
                          </td>
                          <td
                            className={`border border-black p-1 text-center uppercase ${
                              generalAverage != null && generalAverage >= 75 ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {generalAverage == null ? "" : generalAverage >= 75 ? "Passed" : "Failed"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* RIGHT: VALUES (still static AO) */}
                  <div>
                    <div className="text-center mb-6">
                      <h1 className="text-lg font-bold">REPORT ON LEARNER'S OBSERVED VALUES</h1>
                    </div>

                    <table className="w-full border-[1.5px] border-black text-[10px] border-collapse">
                      <thead>
                        <tr className="font-bold">
                          <th className="border border-black p-2 text-center" rowSpan={2}>
                            Core Values
                          </th>
                          <th className="border border-black p-2 text-center" rowSpan={2}>
                            Behavior Statement
                          </th>
                          <th className="border border-black p-1 text-center" colSpan={4}>
                            Quarter
                          </th>
                        </tr>
                        <tr className="font-bold text-center">
                          {["1", "2", "3", "4"].map((q) => (
                            <th key={q} className="border border-black p-1 w-8">
                              {q}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {CORE_VALUES_DATA.map((val, idx) => (
                          <React.Fragment key={idx}>
                            {val.statements.map((stmt, sIdx) => (
                              <tr key={sIdx}>
                                {sIdx === 0 && (
                                  <td className="border border-black p-2 font-bold w-32" rowSpan={val.statements.length}>
                                    {val.value}
                                  </td>
                                )}
                                <td className="border border-black p-2 leading-tight">{stmt}</td>
                                {["1", "2", "3", "4"].map((q) => (
                                  <td key={q} className="border border-black p-1 text-center font-medium">
                                    AO
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-12 h-full">
                  {/* --- LEFT SIDE: ATTENDANCE & SIGNATURES --- */}
                                <div className="border-r border-slate-100 pr-12">
                                <div className="text-center mb-8">
                                    <h2 className="text-lg font-bold uppercase tracking-tight">Attendance Record</h2>
                                </div>

                                <table className="w-full border-[1.5px] border-black text-[9px] border-collapse text-center">
                                    <thead>
                                    <tr className="font-bold">
                                        <th className="border border-black p-1 text-left bg-slate-50">Month</th>
                                        {MONTHS.slice(1).map((m) => (
                                        <th key={m} className="border border-black p-1">{m}</th>
                                        ))}
                                        <th className="border border-black p-1">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="border border-black p-2 text-left font-bold bg-slate-50">No. of School Days</td>
                                        {Array(12).fill(0).map((_, i) => (
                                        <td key={i} className="border border-black p-1">20</td>
                                        ))}
                                        <td className="border border-black p-1 font-bold">240</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 text-left font-bold bg-slate-50">No. of Days Present</td>
                                        {Array(12).fill(0).map((_, i) => (
                                        <td key={i} className="border border-black p-1">20</td>
                                        ))}
                                        <td className="border border-black p-1 font-bold">240</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 text-left font-bold bg-slate-50">No. of Days Absent</td>
                                        {Array(12).fill(0).map((_, i) => (
                                        <td key={i} className="border border-black p-1">0</td>
                                        ))}
                                        <td className="border border-black p-1 font-bold">0</td>
                                    </tr>
                                    </tbody>
                                </table>

                                {/* PARENT SIGNATURE SECTION */}
                                <div className="mt-16">
                                    <h3 className="text-center font-bold text-[11px] mb-8 uppercase tracking-widest border-b border-black pb-2">
                                    Parent / Guardian's Signature
                                    </h3>
                                    <div className="space-y-8">
                                    {["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"].map((q) => (
                                        <div key={q} className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold w-20">{q}:</span>
                                        <div className="flex-1 border-b border-black"></div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                  </div>

                  <div className="flex flex-col items-center px-8">
                    <div className="text-center my-10 space-y-2">
                      <h1 className="text-2xl font-black tracking-tighter uppercase">Learner&apos;s Progress Report Card</h1>
                      <p className="text-sm font-bold">(SF 9 - ES)</p>
                      <p className="text-md font-bold mt-4 underline decoration-2 underline-offset-4">
                        School Year: 2025-2026
                      </p>
                    </div>

                    <div className="w-full space-y-5 text-[12px] mt-6">
                      <div className="flex border-b border-black pb-1">
                        <span className="font-bold w-16">Name:</span>
                        <span className="uppercase font-black text-sm tracking-wide">
                          {student ? `${student.first_name} ${student.last_name}` : "__________"}
                        </span>
                      </div>
                      <div className="flex gap-10">
                        <div className="flex border-b border-black pb-1 flex-1">
                          <span className="font-bold w-12">Age:</span>
                          <span>{student?.age ?? "—"}</span>
                        </div>
                        <div className="flex border-b border-black pb-1 flex-1">
                          <span className="font-bold w-12">Sex:</span>
                          <span>{student?.sex ?? "—"}</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex border-b border-black pb-1 flex-1">
                          <span className="font-bold w-16">Grade:</span>
                          <span>{student?.grade_level ?? "—"}</span>
                        </div>
                        <div className="flex border-b border-black pb-1 flex-1">
                          <span className="font-bold w-16">Section:</span>
                          <span>{student?.section_name ?? "—"}</span>
                        </div>
                      </div>
                      <div className="flex border-b border-black pb-1">
                        <span className="font-bold w-16">LRN:</span>
                        <span className="tracking-[3px]">{student?.school_id ?? "—"}</span>
                      </div>
                    </div>

                    <img src={deped_logo} alt="DepEd" className="w-20 h-20 object-contain mt-10 opacity-80" />
                  </div>
                </div>
<<<<<<< HEAD
            )}

=======
              )}
            </div>
          </div>
>>>>>>> Backup
        </div>
      )}
    </div>
  );
}
