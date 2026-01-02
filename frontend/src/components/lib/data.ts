import type { Subject, Assignment, Grade, Student, Quiz, Resource, SubjectGrade } from './types';


export const grades: Grade[] = [
  { id: 'GRD-001', subjectId: 'SUB-03', subjectName: 'Mathematics', assignmentName: 'Algebra I Test', score: 95, total: 100, date: '2025-09-15' },
  { id: 'GRD-002', subjectId: 'SUB-03', subjectName: 'Mathematics', assignmentName: 'Geometry Quiz', score: 88, total: 100, date: '2025-10-01' },
  { id: 'GRD-003', subjectId: 'SUB-02', subjectName: 'English', assignmentName: 'Book Report', score: 92, total: 100, date: '2025-09-20' },
  { id: 'GRD-004', subjectId: 'SUB-04', subjectName: 'Science', assignmentName: 'Midterm Exam', score: 90, total: 100, date: '2025-10-10' },
  { id: 'GRD-005', subjectId: 'SUB-05', subjectName: 'Araling Panlipunan (AP)', assignmentName: 'Presentation', score: 94, total: 100, date: '2025-09-28' },
  { id: 'GRD-006', subjectId: 'SUB-07', subjectName: 'MAPEH', assignmentName: 'Portfolio Review', score: 98, total: 100, date: '2025-10-05' },
  { id: 'GRD-007', subjectId: 'SUB-01', subjectName: 'Filipino', assignmentName: 'Pagsusulit sa Panitikan', score: 89, total: 100, date: '2025-10-12' },
];

const averageGrade = grades.reduce((acc, grade) => acc + (grade.score / grade.total), 0) / grades.length * 100;

export const student: Student = {
  id: 'STU-001',
  name: 'Juan Dela Cruz',
  gpa: averageGrade,
  performance: 85,
};

export const subjects: Subject[] = [
  { id: 'SUB-01', name: 'Filipino', teacher: 'G. Reyes', progress: 75, grade: 89, color: 'bg-red-400' },
  { id: 'SUB-02', name: 'English', teacher: 'Ms. Smith', progress: 60, grade: 92, color: 'bg-blue-400' },
  { id: 'SUB-03', name: 'Mathematics', teacher: 'Mr. Garcia', progress: 85, grade: 91, color: 'bg-yellow-400' },
  { id: 'SUB-04', name: 'Science', teacher: 'Gng. Santos', progress: 70, grade: 90, color: 'bg-green-400' },
  { id: 'SUB-05', name: 'Araling Panlipunan (AP)', teacher: 'G. Mercado', progress: 45, grade: 94, color: 'bg-amber-600' },
  { id: 'SUB-06', name: 'Edukasyon sa Pagpapakatao (ESP)', teacher: 'G. Villanueva', progress: 90, grade: 98, color: 'bg-purple-400' },
  { id: 'SUB-07', name: 'MAPEH', teacher: 'Gng. Perez', progress: 80, grade: 96, color: 'bg-orange-400' },
];


export const subjectGrades: SubjectGrade[] = [
  { subjectId: 'SUB-01', subjectName: 'Filipino', q1: 88, q2: 90, q3: 89, q4: 92, finalGrade: 89.75, status: 'Passed' },
  { subjectId: 'SUB-02', subjectName: 'English', q1: 92, q2: 94, q3: 91, q4: 93, finalGrade: 92.50, status: 'Passed' },
  { subjectId: 'SUB-03', subjectName: 'Mathematics', q1: 90, q2: 88, q3: 92, q4: 94, finalGrade: 91.00, status: 'Passed' },
  { subjectId: 'SUB-04', subjectName: 'Science', q1: 89, q2: 91, q3: 88, q4: 90, finalGrade: 89.50, status: 'Passed' },
  { subjectId: 'SUB-05', subjectName: 'Araling Panlipunan (AP)', q1: 94, q2: 92, q3: 95, q4: null, finalGrade: 93.67, status: 'Incomplete' },
  { subjectId: 'SUB-06', subjectName: 'Edukasyon sa Pagpapakatao (ESP)', q1: 98, q2: 97, q3: 99, q4: 98, finalGrade: 98.00, status: 'Passed' },
  { subjectId: 'SUB-07', subjectName: 'MAPEH', q1: 95, q2: 96, q3: 94, q4: 97, finalGrade: 95.50, status: 'Passed' },
];

export const assignments: Assignment[] = [
  { id: 'ASG-001', subjectId: 'SUB-03', subjectName: 'Mathematics', title: 'Algebra II Worksheet', dueDate: '2025-08-15T10:00:00.000Z', status: 'Not Submitted', difficulty: 'medium', type: 'Seatwork' },
  { id: 'ASG-002', subjectId: 'SUB-02', subjectName: 'English', title: 'Essay on Philippine Literature', dueDate: '2025-08-18T23:59:00.000Z', status: 'Not Submitted', difficulty: 'hard', type: 'Assignment' },
  { id: 'ASG-003', subjectId: 'SUB-04', subjectName: 'Science', title: 'Lab Report: Climate Change', dueDate: '2025-08-20T23:59:00.000Z', status: 'Not Submitted', difficulty: 'medium', type: 'Project' },
];


export const quizzes: Quiz[] = [
    { id: 'QZ-001', subjectId: 'SUB-03', subjectName: 'Mathematics', title: 'Calculus I Activity', dueDate: '2025-08-28T23:59:00.000Z', timeLimit: 30, questions: 15, status: 'Not Taken', type: 'Quiz' },
    { id: 'QZ-002', subjectId: 'SUB-02', subjectName: 'English', title: 'Grammar and Punctuation', dueDate: '2025-09-03T23:59:00.000Z', timeLimit: 20, questions: 25, status: 'Completed', type: 'Quiz' },
    { id: 'QZ-003', subjectId: 'SUB-04', subjectName: 'Science', title: 'Biology Basics', dueDate: '2025-08-29T23:59:00.000Z', timeLimit: 45, questions: 30, status: 'Not Taken', type: 'Long Test' },
    { id: 'QZ-004', subjectId: 'SUB-01', subjectName: 'Filipino', title: 'Pagsusuri ng Tula', dueDate: '2025-09-08T23:59:00.000Z', timeLimit: 30, questions: 20, status: 'Not Taken', type: 'Exam' },
];

export const resources: Resource[] = [
    { id: 'RES-001', subjectId: 'SUB-03', title: 'Linear Algebra Slides', type: 'File', url: '#', description: 'Week 3 lecture slides on Linear Algebra.' },
    { id: 'RES-007', subjectId: 'SUB-03', title: 'Calculus Cheat Sheet', type: 'File', url: '#', description: 'A handy cheat sheet for derivatives and integrals.' },
    { id: 'RES-002', subjectId: 'SUB-02', title: 'Purdue OWL', type: 'Link', url: 'https://owl.purdue.edu/', description: 'A great online resource for writing.' },
    { id: 'RES-008', subjectId: 'SUB-02', title: 'Shakespeare\'s Sonnets', type: 'File', url: '#', description: 'A collection of all of Shakespeare\'s sonnets.' },
    { id: 'RES-003', subjectId: 'SUB-04', title: 'Khan Academy: Chemistry', type: 'Video', url: 'https://www.khanacademy.org/science/chemistry', description: 'Helpful videos explaining key chemistry concepts.' },
    { id: 'RES-009', subjectId: 'SUB-04', title: 'Periodic Table', type: 'Link', url: 'https://ptable.com/', description: 'An interactive periodic table.' },
    { id: 'RES-005', subjectId: 'SUB-05', title: 'Kasaysayan ng Pilipinas', type: 'Video', url: '#', description: 'Engaging video series on Philippine history.' },
    { id: 'RES-010', subjectId: 'SUB-05', title: 'Mga Bayani ng Pilipinas', type: 'File', url: '#', description: 'Full text of the historical document.' },
    { id: 'RES-006', subjectId: 'SUB-07', title: 'Fundamentals of Music Theory', type: 'File', url: '#', description: 'An introduction to music theory.' },
    { id: 'RES-011', subjectId: 'SUB-07', title: 'National Museum Virtual Tour', type: 'Link', url: '#', description: 'Take a virtual tour of the National Museum.' },
    { id: 'RES-004', subjectId: 'SUB-01', title: 'Panitikang Filipino', type: 'Link', url: '#', description: 'Official documentation for React.' },
    { id: 'RES-012', subjectId: 'SUB-06', title: 'Character Education Guide', type: 'Link', url: '#', description: 'Official getting started guides for Node.js.' },
];


export type { Subject, Assignment, Grade, Student, Quiz, Resource, SubjectGrade };
