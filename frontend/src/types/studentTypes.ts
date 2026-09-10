export type PageKey = 'dashboard' | 'subjects' | 'grades'  ;
export type SubjectAccent = 'violet' | 'green' | 'amber' | 'blue';
export type SubjectIconName = 'code' | 'database' | 'calculator' | 'book';

export interface StudentProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    grade_level: string;
    academic_year: string;
    role: string;
}

export interface StudentSubjectOffering {
  id: number;
  subject_name: string;
  teacher_name: string;
  section_name: string;
  grade_level: string;
  room_number: string;
  schedule: string;

  progress: number;
  average: number;
  quarters: Record<string, number>;
  final_grade: number | null;
}


export interface Subject {
    id: string;
    subjectName: string;
    teacherName: string;
    days: string;
    time: string;
    accent: SubjectAccent;
}

export interface Semester {
    id: string;
    label: string;
    academicYear: string;
}

// activity grade will be input here later on

export interface SubjectGrade {
    subjectId: string;
    subjectName: string;
    initialGrade: number | null;
    transmutedGrade: number | null;
}

export interface SemesterGradeReport {
    semesterId: string;
    rows: SubjectGrade[];
    average: number | null; // average of all transmuted grades for the semester
    gpa: number | null; 
    result: 'passed' | 'failed';
}

export interface PortalSnapshot {
    currentSemesterId: string;
    student: StudentProfile;
    semesters: Semester[];
    subjects: Subject[];
    gradeReports: SemesterGradeReport[];

}

export type QuizStatus = "DRAFT" | "SCHEDULED" | "OPEN" | "CLOSED";

export interface StudentQuiz {
  id: number;
  quiz_id: string;
  SubjectOffering: number;

  subject_name: string;
  teacher_name: string;

  title: string;
  description: string;

  open_time: string;
  close_time: string;
  time_limit: number;

  total_points: number;
  allow_multiple_attempts: boolean;
  question_count: number;

  is_open: boolean;
  is_upcoming: boolean;
  is_closed: boolean;

  user_attempts: number;
}

export interface StudentSubjectFile {
    id: number;
    title: string;
    file_url: string;
    file_size: number;
    content_type: string;
    created_at: string;
}

// for grade/report card section types

export interface GradeComponent {
  score: number;
  total: number;
  percentage: number;
  weight: number;
  weighted_score: number;
}

export interface StudentSubjectSemesterGrade {
  subject_offering_id: number;
  subject_name: string;
  teacher_name: string;

  written_work: GradeComponent;
  performance_task: GradeComponent;
  final_exam: GradeComponent;

  initial_grade: number | null;
  transmuted_grade: number | null;
  remarks: "PASSED" | "FAILED" | "INCOMPLETE" | null;
}

export interface StudentSemesterGradeReport {
  semester_id: number;
  semester_name: string;
  school_year: string;

  subjects: StudentSubjectSemesterGrade[];

  semester_average: number | null;
  result: "PASSED" | "FAILED" | "INCOMPLETE";
}