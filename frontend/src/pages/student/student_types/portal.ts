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