export interface SubjectGrade {
  subject: string;
  q1: number | "";
  q2: number | "";
  q3: number | "";
  q4: number | "";
  final: number | "";
  remarks: "Passed" | "Failed" | "";
}

export interface Student {
  id: string;
  name: string;
  lrn: string;
  age: string;
  sex: "Male" | "Female";
  grade: string;
  section: string;
  grades: SubjectGrade[];
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: "2024-001",
    name: "DELA CRUZ, Juan A.",
    lrn: "123456789012",
    age: "13",
    sex: "Male",
    grade: "7",
    section: "Diamond",
    grades: [
      { subject: "Filipino 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "English 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Mathematics 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Science 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Araling Panlipunan (AP) 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Edukasyon sa Pagpapakatao (EsP) 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Edukasyong Pantahanan at Pangkabuhayan (EPP) 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "MAPEH 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Music 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Art 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "P. E. 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Health 7", q1: 45, q2: 45, q3: 55, q4: 55, final: 65, remarks: "Failed" },

    ]
  },
  {
    id: "2024-002",
    name: "CAMACHO, Juan A.",
    lrn: "123456789012",
    age: "13",
    sex: "Male",
    grade: "7",
    section: "Diamond",
    grades: [
      { subject: "Filipino 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "English 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Mathematics 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Science 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Araling Panlipunan (AP) 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Edukasyon sa Pagpapakatao (EsP) 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Edukasyong Pantahanan at Pangkabuhayan (EPP) 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "MAPEH 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Music 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Art 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "P. E. 7", q1: 75, q2: 75, q3: 75, q4: 75, final: 75, remarks: "Passed" },
      { subject: "Health 7", q1: 45, q2: 45, q3: 55, q4: 55, final: 65, remarks: "Failed" },

    ]
  }
  // ... rest of students
];