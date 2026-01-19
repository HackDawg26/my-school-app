import React, { useState, type JSX } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import deped_logo from '../../../assets/deped_logo.png';

// --- Type Definitions to match your JSX structure ---





// Extension type for jsPDF to support autoTable properties
type jsPDFCustom = jsPDF & {
    lastAutoTable: {
        finalY: number;
    };
};

const CORE_VALUES_DATA = [
    { 
        value: "1. Maka-Diyos", 
        statements: [
            "Expresses one's spiritual beliefs while respecting the spiritual beliefs of others",
            "Shows adherence to ethical principles by upholding truth"
        ]
    },
    { 
        value: "2. Makatao", 
        statements: [
            "Is sensitive to individual, social, and cultural differences",
            "Demonstrates contributions toward solidarity"
        ]
    },
    { 
        value: "3. Makakalikasan", 
        statements: [
            "Cares for the environment and utilizes resources wisely, judiciously, and economically"
        ] 
    },
    { 
        value: "4. Makabansa", 
        statements: [
            "Demonstrates pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen",
            "Demonstrates appropriate behavior in carrying out activities in the school, community, and country"
        ] 
    },
];


const MONTHS = ['','AUG', 'SEPT','OCT','NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JULY'];

export default function ExportReportCardPDF(): JSX.Element {
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
        });
    };

    const coreValuesBody: any[][] = CORE_VALUES_DATA.flatMap(item => {
        const numStatements = item.statements.length;
        const quarterCells = [' ', ' ', ' ', ' '];

        if (numStatements === 1) {
            return [
                [ item.value, item.statements[0], ...quarterCells ]
            ];
        }

        const rows = [];
        rows.push([
            { content: item.value, rowSpan: numStatements, styles: { valign: 'middle'} },
            item.statements[0],
            ...quarterCells
        ]);

        for (let i = 1; i < numStatements; i++) {
            rows.push([
                item.statements[i], 
                ...quarterCells
            ]);
        }
        return rows;
    });

    const handleExport = async (): Promise<void> => {
        // Casting to our custom type ensures lastAutoTable.finalY is accessible
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: 'pt',
            format: "a4",
        }) as jsPDFCustom;

        // 1. DATA PREPARATION (Strictly following your JSX logic)
        const learningAreasBody = [
            ["Filipino 7", "75", "75", "75", "75", "75", "Passed"],
            ["English 7", "75", "75", "75", "75", "75", "Passed"],
            ["Mathematics 7", "75", "75", "75", "75", "75", "Passed"],
            ["Science 7", "75", "75", "75", "75", "75", "Passed"],
            ["Araling Panlipunan (AP) 7", "75", "75", "75", "75", "75", "Passed"],
            ["Edukasyon sa Pagpapakatao (EsP) 7", "75", "75", "75", "75", "75", "Passed"],
            ["Health 7", "45", "45", "55", "55", "65", "Failed"],
            ["CAT 7", "", "", "", "", "", ""]
        ];

        // Adding the General Average row exactly as your JSX did
        learningAreasBody.push([
            { 
                content: "General Average", 
                colSpan: 5, 
                styles: { halign: "right", fontStyle: "bold", valign: "middle" } 
            } as any,
            "", "", 
        ]);

        // 2. PAGE 1: LEARNING PROGRESS
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("REPORT ON LEARNING PROGRESS", 72, 40);
        pdf.text("AND ACHIEVEMENT", 144, 56);

        autoTable(pdf, {
            startY: 64,
            head: [
                [
                    { content: "LEARNING AREAS", rowSpan: 2, styles: { halign: "justify", valign: 'middle', fontSize: 12} },
                    { content: "QUARTER", colSpan: 4, styles: { halign: "center" , fontSize: 11} },
                    { content: "FINAL GRADE", rowSpan: 2, styles: { halign: "center", valign: 'middle' , fontSize: 12} }, 
                    { content: "REMARKS", rowSpan: 2, styles: { halign: "justify", valign: 'middle', fontSize: 12 } },
                ],
                ["1", "2", "3", "4"], 
            ],
            body: learningAreasBody,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold" },
            styles: { fontSize: 10, textColor:0, valign: 'middle', lineWidth: 0.5, lineColor: [0, 0, 0]},
            tableWidth: 350,
        });


        const finalYLeft = (pdf).lastAutoTable.finalY;

        pdf.setFontSize(16);
        pdf.text(`REPORT ON LEARNER'S OBSERVED VALUES`, 430, 40);

        autoTable(pdf, {
            startY: 64, 
            margin:{left: 420},
            head: [
                [
                    { content: "Core Values", rowSpan: 2 ,styles: { halign: "center", fontSize: 12, cellWidth: 96} },
                    { content: "Behavior Statement",rowSpan: 2 , styles: { halign: "center", fontSize: 12 } },
                    { content: "Quarter", colSpan: 4, styles: { halign: "center" , fontSize: 11} },
                ],
                [ "1", "2", "3", "4"],
            ],
            body: coreValuesBody, 
            theme: "grid",
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold" },
            styles: { textColor:0, fontSize: 10, valign: 'middle', lineWidth: 0.5, lineColor: [0, 0, 0] },
            columnStyles: { 
                0: { halign: 'left' }, 1: { halign: 'justify', cellPadding: 9},
                2: { halign: 'center', cellWidth: 20}, 3: { halign: 'center', cellWidth: 20 }, 
                4: { halign: 'center', cellWidth: 20}, 5: { halign: 'center' , cellWidth: 20},
            },
            tableWidth: 380,
        });

        autoTable(pdf, {
            startY: finalYLeft + 15,
            margin:{left: 50},
            head: [
                [ { content: "Descriptors" }, { content: "Grading Scale" }, { content: "Remarks"} ],
            ],
            body: [ 
                ["Outstanding Performance","90-100 Excellent", "Passed"],
                ["Very Satisfactory","85-89 Very Good","Passed"],
                ["Satisfactory","80-84 Good","Passed"],
                ["Fairly Satisfactory","75-79 Fair","Passed"],
                ["Did Not Meet Expectations","Below 75","Failed"],
            ],
            theme: "plain",
            styles: { fontSize: 10, cellPadding:2 },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'left' } },
            tableWidth: 350
        });

        autoTable(pdf,{
            startY: 447, 
            margin:{left: 430},
            head:[ [ {content: 'Marking'}, {content: ' Non-Numerical Rating'} ] ],
            body:[ ['AO', 'Always Observed'], ['SO', 'Sometimes Observed'], ['RO', 'Rarely Observed'], ['NO', 'Not Observed'] ],
            theme: "plain",
            styles: { fontSize: 10, cellPadding:2 },
            columnStyles:{ 0:{halign:'center'}, 1:{halign:'left'} }
        });
        
        pdf.addPage();
        const pageWidth = pdf.internal.pageSize.width;
        const centerX = pageWidth / 2;
        const rightColX = centerX + 40; // Starting point for the right side

        // --- LEFT SIDE OF PAGE 2 (Attendance & Signatures) ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Attendance Record", 150, 60, { align: "center" });

        autoTable(pdf, {
            startY: 70,
            margin: { left: 40 },
            tableWidth: 340,
            head: [MONTHS],
            body: [
                ['No. of School Days', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['No. of Days Present', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['No. of Times Absent', '', '', '', '', '', '', '', '', '', '', '', '']
            ],
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 3, halign: 'center' },
            headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.5 },
            columnStyles: { 0: { halign: 'left', cellWidth: 70, fontStyle: 'bold' } }
        });

        const sigY = pdf.lastAutoTable.finalY + 40;
        pdf.setFontSize(11);
        pdf.text("PARENT/GUARDIAN'S SIGNATURE", 150, sigY, { align: "center" });
        
        const quarters = ["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"];
        quarters.forEach((q, i) => {
            const yPos = sigY + 30 + (i * 30);
            pdf.setFont("helvetica", "normal");
            pdf.text(q, 60, yPos);
            pdf.line(130, yPos, 350, yPos); // Signature line
        });

        // --- RIGHT SIDE OF PAGE 2 (The Cover - Based on your Image) ---
        
        // Right Side Header with Logo
         // or base64
        try {
            const imgData = await getBase64ImageFromURL(deped_logo);
            // Positioned to the left of the "Republic of the Philippines" text
            pdf.addImage(imgData, 'PNG', rightColX + 15, 50, 40, 40); 
        } catch (e) {
            console.error("Logo failed to load", e);
        }

        // Header Info
        pdf.setFontSize(8);
        pdf.text("Sf 9 - ES", rightColX, 40);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("Republic of the Philippines", centerX + 200, 65, { align: "center" });
        pdf.text("DEPARTMENT OF EDUCATION", centerX + 200, 78, { align: "center" });

        pdf.setFont("helvetica", "normal");
        const schoolInfoY = 105;
        const labels = ["Region", "Division", "District", "School"];
        labels.forEach((label, i) => {
            pdf.text(`${label}: __________________________________________`, rightColX, schoolInfoY + (i * 18));
        });

        // Title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("LEARNER'S PROGRESS REPORT CARD", centerX + 200, 190, { align: "center" });
        pdf.setFontSize(10);
        pdf.text("School Year: 2019-2020", centerX + 200, 205, { align: "center" });

        // Student Basic Info
        pdf.setFont("helvetica", "normal");
        pdf.text("Name: ____________________________________________________", rightColX, 230);
        pdf.text("Age: ___________", rightColX, 250);
        pdf.text("Sex: ___________", centerX + 220, 250);
        pdf.text("Grade: ________", rightColX, 270);
        pdf.text("Section: _______", centerX + 180, 270);
        pdf.text("LRN: ___________", centerX + 280, 270);

        // Parent Message
        pdf.setFontSize(9);
        const message = "Dear Parent, \n\nThis report card shows the ability and the progress your child has made in the different learning areas as well as his/her progress in core values.\n\nThe school welcomes you should you desire to know more about your child's progress.";
        pdf.text(message, rightColX, 300, { maxWidth: 350, align: 'justify' });

        // Teacher Signatures
        pdf.line(rightColX + 200, 380, rightColX + 340, 380);
        pdf.text("Teacher", rightColX + 270, 390, { align: "center" });

        pdf.line(rightColX, 410, rightColX + 150, 410);
        pdf.text("Head Teacher / Principal", rightColX + 75, 420, { align: "center" });

        // Certificate of Transfer (Bottom part)
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

        pdf.save("DepEd_SF9_ReportCard.pdf");
    };

    return (
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

                {/* Action Group */}
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
            </div>

            {showPreview && (
                <div className="mt-6 border-t border-slate-200 pt-8 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Live SF9 Preview</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Draft generated from current entry data</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setActivePage(1)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activePage === 1 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Page 1: Grades & Values</button>
                        <button onClick={() => setActivePage(2)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activePage === 2 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Page 2: Attendance & Cover</button>
                    </div>
                    </div>

                    {/* SCALE WRAPPER: This ensures the card fits the screen while maintaining A4 proportions */}
                    <div className="bg-slate-200/50 rounded-3xl p-10 overflow-hidden flex justify-center border border-slate-200">
                    <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[1122px] min-w-[1122px] h-[794px] p-12 origin-top transform scale-[0.55] md:scale-[0.75] lg:scale-[0.85] xl:scale-100 my-[-15%] xl:my-0 text-black font-sans">
                        
                        {activePage === 1 ? (
                        <div className="grid grid-cols-2 gap-12 h-full">
                            {/* --- LEFT SIDE: LEARNING PROGRESS --- */}
                            <div className="border-r border-slate-100 pr-12">
                            <div className="text-center mb-6">
                                <h1 className="text-lg font-bold">REPORT ON LEARNING PROGRESS</h1>
                                <h1 className="text-lg font-bold">AND ACHIEVEMENT</h1>
                            </div>

                            <table className="w-full border-[1.5px] border-black text-[11px] border-collapse">
                                <thead>
                                <tr className="font-bold">
                                    <th className="border border-black p-2 text-center" rowSpan={2}>LEARNING AREAS</th>
                                    <th className="border border-black p-1 text-center" colSpan={4}>QUARTER</th>
                                    <th className="border border-black p-1 text-center" rowSpan={2}>FINAL GRADE</th>
                                    <th className="border border-black p-1 text-center" rowSpan={2}>REMARKS</th>
                                </tr>
                                <tr className="font-bold text-center">
                                    {["1", "2", "3", "4"].map(q => <th key={q} className="border border-black p-1 w-10">{q}</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                {/* Subject Data Mapping from your handleExport */}
                                {[
                                    ["Filipino 7", "75", "75", "75", "75", "75", "Passed"],
                                    ["English 7", "75", "75", "75", "75", "75", "Passed"],
                                    ["Mathematics 7", "75", "75", "75", "75", "75", "Passed"],
                                    ["Science 7", "75", "75", "75", "75", "75", "Passed"],
                                    ["Araling Panlipunan (AP) 7", "75", "75", "75", "75", "75", "Passed"],
                                    ["Edukasyon sa Pagpapakatao (EsP) 7", "75", "75", "75", "75", "75", "Passed"],
                                    ["Health 7", "45", "45", "55", "55", "65", "Failed"],
                                    ["CAT 7", "", "", "", "", "", ""]
                                ].map((row, i) => (
                                    <tr key={i} className={row[6] === "Failed" ? "bg-red-50" : ""}>
                                    <td className="border border-black p-2 font-medium">{row[0]}</td>
                                    <td className="border border-black p-1 text-center">{row[1]}</td>
                                    <td className="border border-black p-1 text-center">{row[2]}</td>
                                    <td className="border border-black p-1 text-center">{row[3]}</td>
                                    <td className="border border-black p-1 text-center">{row[4]}</td>
                                    <td className="border border-black p-1 text-center font-bold">{row[5]}</td>
                                    <td className={`border border-black p-1 text-center text-[10px] font-bold uppercase ${row[6] === 'Passed' ? 'text-emerald-700' : 'text-red-700'}`}>{row[6]}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold bg-slate-50">
                                    <td className="border border-black p-2 text-right" colSpan={5}>General Average</td>
                                    <td className="border border-black p-1 text-center underline">71</td>
                                    <td className="border border-black p-1 text-center text-red-700 uppercase">Failed</td>
                                </tr>
                                </tbody>
                            </table>

                            <div className="mt-8">
                                <table className="w-full text-[10px] border-none">
                                <thead><tr className="font-bold italic"><td>Descriptors</td><td>Grading Scale</td><td>Remarks</td></tr></thead>
                                <tbody className="italic text-slate-600">
                                    <tr><td>Outstanding Performance</td><td>90-100 Excellent</td><td>Passed</td></tr>
                                    <tr><td>Very Satisfactory</td><td>85-89 Very Good</td><td>Passed</td></tr>
                                    <tr><td>Did Not Meet Expectations</td><td>Below 75</td><td>Failed</td></tr>
                                </tbody>
                                </table>
                            </div>
                            </div>

                            {/* --- RIGHT SIDE: OBSERVED VALUES --- */}
                            <div>
                            <div className="text-center mb-6">
                                <h1 className="text-lg font-bold">REPORT ON LEARNER'S OBSERVED VALUES</h1>
                            </div>

                            <table className="w-full border-[1.5px] border-black text-[10px] border-collapse">
                                <thead>
                                <tr className="font-bold">
                                    <th className="border border-black p-2 text-center" rowSpan={2}>Core Values</th>
                                    <th className="border border-black p-2 text-center" rowSpan={2}>Behavior Statement</th>
                                    <th className="border border-black p-1 text-center" colSpan={4}>Quarter</th>
                                </tr>
                                <tr className="font-bold text-center">
                                    {["1", "2", "3", "4"].map(q => <th key={q} className="border border-black p-1 w-8">{q}</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                {CORE_VALUES_DATA.map((val, idx) => (
                                    <React.Fragment key={idx}>
                                    {val.statements.map((stmt, sIdx) => (
                                        <tr key={sIdx}>
                                        {sIdx === 0 && (
                                            <td className="border border-black p-2 font-bold w-32" rowSpan={val.statements.length}>{val.value}</td>
                                        )}
                                        <td className="border border-black p-2 leading-tight">{stmt}</td>
                                        {["1","2","3","4"].map(q => <td key={q} className="border border-black p-1 text-center font-medium">AO</td>)}
                                        </tr>
                                    ))}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>

                            <div className="mt-8 grid grid-cols-2 text-[10px] gap-4">
                                <div className="flex flex-col gap-1">
                                <p className="font-bold uppercase">Marking Code:</p>
                                <p>AO - Always Observed</p>
                                <p>SO - Sometimes Observed</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                <p>RO - Rarely Observed</p>
                                <p>NO - Not Observed</p>
                                </div>
                            </div>
                            </div>
                        </div>
                        ) : (
                        /* --- PAGE 2 PREVIEW (OMITTED FOR BREVITY BUT USES SAME A4 BOX) --- */
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

                                {/* --- RIGHT SIDE: THE OFFICIAL COVER --- */}
                                <div className="flex flex-col items-center px-8">
                                {/* Header with Logo */}
                                <div className="flex items-center justify-center gap-6 mb-8 w-full">
                                    <img src={deped_logo} alt="DepEd" className="w-20 h-20 object-contain" />
                                    <div className="text-center">
                                    <p className="text-[11px] font-medium italic">Republic of the Philippines</p>
                                    <p className="text-[14px] font-black uppercase leading-tight">Department of Education</p>
                                    <p className="text-[11px] font-bold">Region IV-A CALABARZON</p>
                                    <p className="text-[11px]">Division of Antipolo City</p>
                                    </div>
                                </div>

                                {/* School Info Block */}
                                <div className="w-full space-y-3 text-[12px] mb-12">
                                    <div className="flex border-b border-black pb-1">
                                    <span className="font-bold w-24">School:</span>
                                    <span className="uppercase">Antipolo National High School</span>
                                    </div>
                                    <div className="flex gap-4">
                                    <div className="flex border-b border-black pb-1 flex-1">
                                        <span className="font-bold w-24">District:</span>
                                        <span>Antipolo II</span>
                                    </div>
                                    </div>
                                </div>

                                {/* Report Card Title */}
                                <div className="text-center my-10 space-y-2">
                                    <h1 className="text-2xl font-black tracking-tighter uppercase">Learner's Progress Report Card</h1>
                                    <p className="text-sm font-bold">(SF 9 - ES)</p>
                                    <p className="text-md font-bold mt-4 underline decoration-2 underline-offset-4">School Year: 2025-2026</p>
                                </div>

                                {/* Student Profile */}
                                <div className="w-full space-y-5 text-[12px] mt-6">
                                    <div className="flex border-b border-black pb-1">
                                    <span className="font-bold w-16">Name:</span>
                                    <span className="uppercase font-black text-sm tracking-wide">Juan Dela Cruz</span>
                                    </div>
                                    <div className="flex gap-10">
                                    <div className="flex border-b border-black pb-1 flex-1">
                                        <span className="font-bold w-12">Age:</span>
                                        <span>13</span>
                                    </div>
                                    <div className="flex border-b border-black pb-1 flex-1">
                                        <span className="font-bold w-12">Sex:</span>
                                        <span>Male</span>
                                    </div>
                                    </div>
                                    <div className="flex gap-4">
                                    <div className="flex border-b border-black pb-1 flex-1">
                                        <span className="font-bold w-16">Grade:</span>
                                        <span>7</span>
                                    </div>
                                    <div className="flex border-b border-black pb-1 flex-1">
                                        <span className="font-bold w-16">Section:</span>
                                        <span>Rizal</span>
                                    </div>
                                    </div>
                                    <div className="flex border-b border-black pb-1">
                                    <span className="font-bold w-16">LRN:</span>
                                    <span className="tracking-[3px]">123456789012</span>
                                    </div>
                                </div>

                                {/* Certificate of Transfer */}
                                <div className="mt-12 w-full p-4 border-[1.5px] border-black text-center">
                                    <h4 className="text-[11px] font-black uppercase mb-4">Certificate of Transfer</h4>
                                    <div className="text-[10px] text-left space-y-4">
                                    <p>Admitted to Grade: ________ Section: ________ Room: ________</p>
                                    <p>Eligible for Admission to Grade: _____________________________</p>
                                    <div className="flex justify-between pt-6">
                                        <div className="text-center">
                                        <div className="w-32 border-b border-black"></div>
                                        <p className="mt-1 font-bold">Principal</p>
                                        </div>
                                        <div className="text-center">
                                        <div className="w-32 border-b border-black"></div>
                                        <p className="mt-1 font-bold">Teacher</p>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}
                        
                        
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}