
// --- Mock Data ---
const mockActivities = [
  {
    id: 'ACT-01',
    title: 'Quiz 1: Integers',
    subject: 'Math • Section 1',
    dueDate: 'Nov 05, 2023',
    totalCount: 10,
  },
  {
    id: 'ACT-02',
    title: 'Homework: Fractions',
    subject: 'Math • Section 1',
    dueDate: 'Nov 08, 2023',
    totalCount: 10,
  },
  {
    id: 'ACT-03',
    title: 'Essay: The Renaissance',
    subject: 'Algebra • Section 2',
    dueDate: 'Nov 10, 2023',
    totalCount: 25,
  },
  {
    id: 'ACT-04',
    title: 'Lab Report: Photosynthesis',
    subject: 'Algebra • Section 2',
    dueDate: 'Nov 12, 2023',
    totalCount: 22,
  },
  {
    id: 'ACT-05',
    title: 'Book Report: The Great Gatsby',
    subject: 'Geometry • Section 1',
    dueDate: 'Nov 15, 2023',
    totalCount: 30,
  },
    {
    id: 'ACT-06',
    title: 'Final Project Proposal',
    subject: 'Geometry • Section 1',
    dueDate: 'Nov 20, 2023',
    totalCount: 18,
  },
  {
    id: 'ACT-07',
    title: 'Poetry Analysis',
    subject: 'Geometry • Section 1',
    dueDate: 'Nov 18, 2023',
    totalCount: 25,
  },
];

const mockSubmissions = {
  'ACT-01': [
    { studentId: 'S-071', studentName: 'Anna Reyes', submittedAt: 'Nov 05, 2023, 9:15 AM', status: 'Graded' },
    { studentId: 'S-072', studentName: 'Ben Cruz', submittedAt: 'Nov 05, 2023, 9:20 AM', status: 'Graded' },
    { studentId: 'S-073', studentName: 'Claire Lim', submittedAt: 'Nov 05, 2023, 10:05 AM', status: 'Graded' },
    { studentId: 'S-074', studentName: 'Diego Tan', submittedAt: 'Nov 04, 2023, 8:00 PM', status: 'Graded' },
    { studentId: 'S-075', studentName: 'Ella Santos', submittedAt: 'Nov 05, 2023, 11:30 AM', status: 'Pending' },
    { studentId: 'S-076', studentName: 'Frank Gomez', submittedAt: 'Nov 04, 2023, 5:45 PM', status: 'Graded' },
    { studentId: 'S-077', studentName: 'Gina de la Cruz', submittedAt: 'Nov 05, 2023, 9:00 AM', status: 'Pending' },
  ],
  'ACT-02': [
    { studentId: 'S-071', studentName: 'Anna Reyes', submittedAt: 'Nov 07, 2023, 1:00 PM', status: 'Pending' },
    { studentId: 'S-073', studentName: 'Claire Lim', submittedAt: 'Nov 08, 2023, 9:00 AM', status: 'Pending' },
    { studentId: 'S-078', studentName: 'Harold Pineda', submittedAt: 'Nov 07, 2023, 11:00 PM', status: 'Pending' },
  ],
  'ACT-03': [], // No submissions yet
  'ACT-04': [
    { studentId: 'S-101', studentName: 'Kevin Durant', submittedAt: 'Nov 11, 2023, 2:30 PM', status: 'Graded' },
    { studentId: 'S-102', studentName: 'LeBron James', submittedAt: 'Nov 12, 2023, 10:00 AM', status: 'Pending' },
  ],
    'ACT-05': Array.from({ length: 25 }, (_, i) => ({
        studentId: `S-${120 + i}`,
        studentName: `Student ${120 + i}`,
        submittedAt: `Nov 14, 2023, ${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        status: Math.random() > 0.3 ? 'Graded' : 'Pending',
    })),
    'ACT-06': [
        { studentId: 'S-201', studentName: 'Stephen Curry', submittedAt: 'Nov 19, 2023, 8:00 PM', status: 'Pending' },
    ],
  // ACT-07 has no submissions yet
};
// --- End Mock Data ---

const getStatusClass = (status: 'Graded' | 'Pending' | string): string => {
    const s = status.toLowerCase();
    
    if (s === 'graded') return 'bg-green-100 text-green-700';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    
    return 'bg-gray-100 text-gray-700';
};

export { mockActivities, mockSubmissions, getStatusClass };