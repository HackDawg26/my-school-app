import React, { type JSX } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft } from "lucide-react";
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
        <div className="flex flex-col gap-4 p-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/teacher/advisory-class')}
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