
export type Subject = {
  id: string;
  name: string;
  teacher: string;
  progress: number;
  grade: number;
  color: string;
};

export type Assignment = {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  dueDate: string;
  status: 'Submitted' | 'Not Submitted' | 'Late';
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'Assignment' | 'Seatwork' | 'Project';
};

export type Quiz = {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  dueDate: string;
  timeLimit: number; // in minutes
  status: 'Not Taken' | 'Completed';
  questions: number;
  type: 'Quiz' | 'Exam' | 'Long Test';
};

export type Resource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'File' | 'Link' | 'Video';
  url: string;
  description: string;
};

export type Grade = {
  id: string;
  subjectId: string;
  subjectName: string;
  assignmentName: string;
  score: number;
  total: number;
  date: string;
};

export type SubjectGrade = {
  subjectId: string;
  subjectName: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  finalGrade: number;
  status: 'Passed' | 'Failed' | 'Incomplete';
};

export type Student = {
  student_pk: any;
  id: string;
  name: string;
  gpa: number;
  performance: number;
};

export type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  subjectName?: string;
}

export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  subjectIds: string[];
  adviserOfSectionId?: string | null;
  email?: string;
};

export type Section = {
  id: string;
  yearLevel: number;
  name: string;
};