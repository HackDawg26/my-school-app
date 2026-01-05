import React, { useState, createContext, useContext } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

// --- 1. Define the Shapes ---

export interface Subject {
    id: number;
    subject: string;
    section: string;
    grade: number;
    room: string;
    students: number;
    nextClass: string;
    average: number;
    pendingTasks: number;
}

// This matches the data coming from your Form component
interface NewSubjectData {
    name: string;
    section: string;
    grade: string | number;
    roomNumber: string;
    schedule: string;
}

interface SubjectContextType {
    subjects: Subject[];
    addNewSubject: (data: NewSubjectData) => void;
}

// --- 2. Create the Context with a default value ---

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

// --- 3. Custom Hook with Error Handling ---

export const useSubjects = () => {
    const context = useContext(SubjectContext);
    if (!context) {
        throw new Error('useSubjects must be used within a SubjectProvider');
    }
    return context;
};

// --- 4. Initial Data ---

const INITIAL_SUBJECTS: Subject[] = [
    { id: 1, subject: "Math", section: "1", grade: 7, room: "201", students: 28, nextClass: "Mon 9:00 AM", average: 84, pendingTasks: 3 },
    { id: 2, subject: "Algebra", section: "2", grade: 8, room: "204", students: 26, nextClass: "Tue 10:30 AM", average: 88, pendingTasks: 2 },
    { id: 3, subject: "Geometry", section: "1", grade: 9, room: "305", students: 30, nextClass: "Wed 11:15 AM", average: 81, pendingTasks: 4 },
];

// --- 5. Provider Component ---

export default function SubjectProvider() {
    const [subjects, setSubjects] = useState(INITIAL_SUBJECTS); 
    const navigate = useNavigate();

    const addNewSubject = (newSubjectData: NewSubjectData) => {
        const newSubject: Subject = { 
            id: Date.now(), 
            subject: newSubjectData.name,
            section: newSubjectData.section,
            grade: typeof newSubjectData.grade === 'string' ? parseInt(newSubjectData.grade) : newSubjectData.grade,
            room: newSubjectData.roomNumber,
            nextClass: newSubjectData.schedule,
            students: 0, 
            average: 0, 
            pendingTasks: 0 
        };
        
        setSubjects(prevSubjects => [...prevSubjects, newSubject]);
        navigate('/teacher/subject'); 
    };
    
    const contextValue: SubjectContextType = {
        subjects,
        addNewSubject
    };

    return (
        <SubjectContext.Provider value={contextValue}>
            <Outlet />
        </SubjectContext.Provider>
    );
}