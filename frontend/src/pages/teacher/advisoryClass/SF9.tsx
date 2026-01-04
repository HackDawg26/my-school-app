import React, { type JSX } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import deped_logo from '../../../assets/deped_logo.png';

// --- Type Definitions to match your JSX structure ---

interface GradeRow {
    subject: string;
    grades: string[];
    final: string;
    remarks: string;
}

interface CoreValue {
    value: string;
    statements: string[];
}

// Extension type for jsPDF to support autoTable properties
type jsPDFCustom = jsPDF & {
    lastAutoTable: {
        finalY: number;
    };
};

export default function ExportReportCardPDF(): JSX.Element {
    const navigate = useNavigate();

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

        // 3. PAGE 2: THE COVER (The "Right Side" in your JSX)
        pdf.addPage();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;
        const rightColX = centerX + 40;

        // Republic Header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("Republic of the Philippines", centerX + 200, 65, { align: "center" });
        pdf.text("DEPARTMENT OF EDUCATION", centerX + 200, 78, { align: "center" });

        // Logo Placement (matching your JSX try/catch)
        try {
            const imgData = await getBase64ImageFromURL(deped_logo);
            pdf.addImage(imgData, 'PNG', rightColX + 15, 50, 40, 40); 
        } catch (e) {
            console.error("Logo failed to load", e);
        }

        // Student Info Placeholder Lines
        pdf.setFont("helvetica", "normal");
        pdf.text("Name: ____________________________________________________", rightColX, 230);
        pdf.text("Age: ___________", rightColX, 250);
        pdf.text("Sex: ___________", centerX + 220, 250);

        pdf.save("DepEd_SF9_ReportCard.pdf");
    };

    return (
        <div className="flex flex-col gap-4 p-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/advisory-class')}
                    className="p-2 hover:bg-gray-100 rounded-full inline-flex items-center"
                >
                    <ArrowLeft size={24} />
                    <span className="ml-2">Back</span>
                </button>
                
                <button
                    onClick={handleExport}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
                >
                    Export Report Card PDF
                </button>
            </div>
            
            <p className="text-sm text-gray-500 italic">
                The output will be a 2-page landscape PDF compliant with DepEd SF9 standards.
            </p>
        </div>
    );
}