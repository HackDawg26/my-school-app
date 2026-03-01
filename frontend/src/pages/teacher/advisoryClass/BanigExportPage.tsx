import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const base = "http://127.0.0.1:8000/api";

function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export async function generateBanigPDF() {
  const token = localStorage.getItem("access");
  if (!token) return;

  const payload = parseJwt(token);
  const userId = payload?.user_id ?? payload?.id;

  // =============================
  // FETCH TEACHER (Adviser)
  // =============================
  const teacherRes = await fetch(`${base}/teachers/${userId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const teacher = await teacherRes.json();
  if (!teacher.advisory) return;

  const adviserName = `${teacher.first_name} ${teacher.last_name}`;
  const schoolYear = "2024-2025";
  const curriculumYear = teacher.advisory.grade_level;

  // =============================
  // FETCH STUDENTS
  // =============================
  const studentsRes = await fetch(
    `${base}/sections/${teacher.advisory.id}/students/`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const students = await studentsRes.json();

  // =============================
  // FETCH GRADES (parallel)
  // =============================
  const allStudentData = await Promise.all(
    students.map(async (student: any) => {
      const res = await fetch(
        `${base}/students/${student.id}/quarterly-summary/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const grades = await res.json();
      return { student, grades };
    })
  );

  // =============================
  // COLLECT SUBJECTS
  // =============================
  const subjectMap = new Map<string, any>();

  allStudentData.forEach((s: any) => {
    s.grades.forEach((g: any) => {
      if (!subjectMap.has(g.subject)) {
        subjectMap.set(g.subject, {
          subject: g.subject,
          teacher: g.teacher_name ?? "",
        });
      }
    });
  });

  const subjects = Array.from(subjectMap.values());

  // =============================
  // CREATE PDF
  // =============================
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
  });

  doc.setFontSize(9);

  const nameColWidth = 40; // wider name column
  const ratingColWidth = 10; // each rating column
  const subjectBlockWidth = ratingColWidth * 5;

  // Build header rows
  const headerRow1: any[] = [
    { content: `School Year: ${schoolYear}`, styles: { cellWidth: nameColWidth } },
  ];

  const headerRow2: any[] = [
    { content: `Curriculum Year: ${curriculumYear}`, styles: { cellWidth: nameColWidth } },
  ];

  const headerRow3: any[] = [
    { content: `Adviser: ${adviserName}`, styles: { cellWidth: nameColWidth } },
  ];

  const headerRow4: any[] = [
    { content: "NAME OF STUDENTS/PUPILS", styles: { cellWidth: nameColWidth } },
  ];

  subjects.forEach((s) => {
    // Row 1 - Teacher
    headerRow1.push({
      content: s.teacher,
      colSpan: 5,
      styles: { halign: "center" },
    });

    // Row 2 - Subject
    headerRow2.push({
      content: s.subject,
      colSpan: 5,
      styles: { halign: "center" },
    });

    // Row 3 - PER RATING
    headerRow3.push({
      content: "PER RATING",
      colSpan: 5,
      styles: { halign: "center" },
    });

    // Row 4 - 1 2 3 4 A
    ["1", "2", "3", "4", "A"].forEach((r) => {
      headerRow4.push({ content: r });
    });
  });

  // =============================
  // BUILD STUDENT ROWS
  // =============================
  const body: any[] = [];

  allStudentData.forEach((entry: any) => {
    const row: any[] = [];

    const studentName = `${entry.student.last_name}, ${entry.student.first_name}`;
    row.push(studentName);

    subjects.forEach((subjectInfo: any) => {
      const grade = entry.grades.find(
        (g: any) => g.subject === subjectInfo.subject
      );

      row.push(
        grade?.q1 ?? "",
        grade?.q2 ?? "",
        grade?.q3 ?? "",
        grade?.q4 ?? "",
        grade?.final ?? ""
      );
    });

    body.push(row);
  });

  // =============================
  // RENDER TABLE
  // =============================
  autoTable(doc, {
    head: [headerRow1, headerRow2, headerRow3, headerRow4],
    body: body,
    startY: 10,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineWidth: 0.2,
      lineColor: [0, 0, 0], 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: nameColWidth },
    },
    margin: { left: 5, right: 5 },
  });

  doc.save("BANIG_FORM.pdf");
}
