// --- Interfaces ---

export interface Subject {
    id: string;
    subject: string;
    grade: number;
    section: string;
    room: string;
}

export interface Student {
    id: string;
    name: string;
}

export interface Activity {
    id: string;
    title: string;
    cat: string;
    max: number;
}

// Map of Subject ID -> Student List
export interface StudentsBySubject {
    [subjectId: string]: Student[];
}

// Map of Subject ID -> Activity List
export interface ActivitiesBySubject {
    [subjectId: string]: Activity[];
}

// Map of Subject ID -> Student ID -> Activity ID -> Score
export interface ActivityScores {
    [subjectId: string]: {
        [studentId: string]: {
            [activityId: string]: number;
        };
    };
}

// --- Data ---

export const SUBJECTS: Subject[] = [
    { id: "MATH-7-1", subject: "Math", grade: 7, section: "1", room: "201" },
    { id: "ALG-8-2", subject: "Algebra", grade: 8, section: "2", room: "204" },
    { id: "GEO-9-1", subject: "Geometry", grade: 9, section: "1", room: "305" },
];

export const STUDENTS_BY_SUBJECT: StudentsBySubject = {
    "MATH-7-1": [
        { id: "S-071", name: "Anna Reyes" },
        { id: "S-072", name: "Ben Cruz" },
        { id: "S-073", name: "Claire Lim" },
        { id: "S-074", name: "Diego Tan" },
        { id: "S-075", name: "Ella Santos" },
        { id: "S-076", name: "Frank Gomez" },
        { id: "S-077", name: "Gina de la Cruz" },
        { id: "S-078", name: "Harold Pineda" },
        { id: "S-079", name: "Isabel Mercado" },
        { id: "S-080", name: "Jose Lorenzo" },
        { id: "S-081", name: "Karen Almonte" },
        { id: "S-082", name: "Leo Garcia" },
        { id: "S-083", name: "Maya Fernandez" },
        { id: "S-084", name: "Noel Ramos" },
        { id: "S-085", name: "Oliva Perez" },
        { id: "S-086", name: "Paolo Torres" },
        { id: "S-087", name: "Quinn Vasquez" },
        { id: "S-088", name: "Rina Dela Pena" },
        { id: "S-089", name: "Sam Herrera" },
        { id: "S-090", name: "Tess Montes" },
        { id: "S-091", name: "Ulysses Castro" },
        { id: "S-092", name: "Vina Javier" },
        { id: "S-093", name: "Wilmer Eugenio" },
        { id: "S-094", name: "Xena Soriano" },
        { id: "S-095", name: "Yuri Manalo" },
        { id: "S-096", name: "Zia Navarro" },
        { id: "S-097", name: "Adam Reyes" },
        { id: "S-098", name: "Bea Ocampo" },
        { id: "S-099", name: "Carl David" },
        { id: "S-100", name: "Dana Espiritu" }
    ],
    "ALG-8-2": [
        { id: "S-101", name: "Ethan Foster" },
        { id: "S-102", name: "Fiona Green" },
        { id: "S-103", name: "Gabriel Hayes" },
        { id: "S-104", name: "Hope Irwin" },
        { id: "S-105", name: "Isaac Jones" },
        { id: "S-106", name: "Jasmine King" },
        { id: "S-107", name: "Kevin Lopez" },
        { id: "S-108", name: "Luna Miller" },
        { id: "S-109", name: "Milo Nelson" },
        { id: "S-110", name: "Nora Owens" },
        { id: "S-111", name: "Oliver Platt" },
        { id: "S-112", name: "Penelope Quirk" },
        { id: "S-113", name: "Quentin Reed" },
        { id: "S-114", name: "Rose Stewart" },
        { id: "S-115", name: "Seth Taylor" },
        { id: "S-116", name: "Talia Underwood" },
        { id: "S-117", name: "Victor Vance" },
        { id: "S-118", name: "Willow West" },
        { id: "S-119", name: "Xavier Young" },
        { id: "S-120", name: "Yara Zeller" },
        { id: "S-121", name: "Zane Abbott" },
        { id: "S-122", name: "Amy Barnes" },
        { id: "S-123", name: "Brock Curtis" },
        { id: "S-124", name: "Chloe Davies" },
        { id: "S-125", name: "Dean Evans" },
        { id: "S-126", name: "Elsa Fisher" }
    ],
    "GEO-9-1": [
        { id: "S-127", name: "Gary Hughes" },
        { id: "S-128", name: "Ivy Ibarra" },
        { id: "S-129", name: "Jack Kim" },
        { id: "S-130", name: "Kelly Lopez" },
        { id: "S-131", name: "Liam Martin" },
        { id: "S-132", name: "Mona Navarro" },
        { id: "S-133", name: "Noah Ortiz" },
        { id: "S-134", name: "Pamela Quinn" },
        { id: "S-135", name: "Ray Ramirez" },
        { id: "S-136", name: "Sara Smith" },
        { id: "S-137", name: "Tom Tiamzon" },
        { id: "S-138", name: "Uma Uy" },
        { id: "S-139", name: "Vicente Valera" },
        { id: "S-140", name: "Winnie Wong" },
        { id: "S-141", name: "Xander Xu" },
        { id: "S-142", name: "Yasmine Yuson" },
        { id: "S-143", name: "Zico Zobel" },
        { id: "S-144", name: "Andrew Abelardo" },
        { id: "S-145", name: "Betty Bravo" },
        { id: "S-146", name: "Chris Cortez" },
        { id: "S-147", name: "Dawn Dimagiba" },
        { id: "S-148", name: "Earl Esguerra" },
        { id: "S-149", name: "Faye Francisco" },
        { id: "S-150", name: "Grant Gopez" },
        { id: "S-151", name: "Holly Henares" },
        { id: "S-152", name: "Ian Ilagan" },
        { id: "S-153", name: "Jade Jimenez" },
        { id: "S-154", name: "Kyle Kasilag" },
        { id: "S-155", name: "Laura Lim" },
        { id: "S-156", name: "Mark Mendoza" },
        { id: "S-157", name: "Nina Nolasco" },
        { id: "S-158", name: "Owen Ocampo" },
        { id: "S-159", name: "Pia Puno" },
        { id: "S-160", name: "Quincy Quinto" },
        { id: "S-161", name: "Rachel Reyes" }
    ],
};

export const ACTIVITIES_BY_SUBJECT: ActivitiesBySubject = {
    "MATH-7-1": [
        { id: "Q1", title: "Quiz 1", cat: "Quizzes", max: 20 },
        { id: "A1", title: "Assignment 1", cat: "Assignments", max: 50 },
        { id: "S1", title: "Seatwork 1", cat: "Seatworks", max: 10 },
    ],
    "ALG-8-2": [
        { id: "Q1", title: "Quiz 1", cat: "Quizzes", max: 20 },
        { id: "A1", title: "Assignment 1", cat: "Assignments", max: 40 },
    ],
    "GEO-9-1": [
        { id: "Q1", title: "Angles Quiz", cat: "Quizzes", max: 25 },
        { id: "S1", title: "Seatwork 1", cat: "Seatworks", max: 10 },
    ],
};

export const ACTIVITY_SCORES: ActivityScores = {
    "MATH-7-1": {
        "S-071": { "Q1": 18, "A1": 24, "S1": 9 },
        "S-072": { "Q1": 15, "A1": 40, "S1": 8 },
        "S-073": { "Q1": 14, "A1": 35, "S1": 6 },
        "S-074": { "Q1": 20, "A1": 45, "S1": 9 },
        "S-075": { "Q1": 19, "A1": 18, "S1": 10 },
        "S-076": { "Q1": 13, "A1": 30, "S1": 5 },
        "S-077": { "Q1": 20, "A1": 20, "S1": 10 },
        "S-078": { "Q1": 16, "A1": 38, "S1": 7 },
        "S-079": { "Q1": 19, "A1": 26, "S1": 10 },
        "S-080": { "Q1": 17, "A1": 12, "S1": 8 },
        "S-081": { "Q1": 14, "A1": 34, "S1": 6 },
        "S-082": { "Q1": 19, "A1": 27, "S1": 9 },
        "S-083": { "Q1": 18, "A1": 33, "S1": 8 },
        "S-084": { "Q1": 12, "A1": 28, "S1": 5 },
        "S-085": { "Q1": 20, "A1": 19, "S1": 10 },
        "S-086": { "Q1": 16, "A1": 21, "S1": 8 },
        "S-087": { "Q1": 15, "A1": 36, "S1": 7 },
        "S-088": { "Q1": 19, "A1": 37, "S1": 9 },
        "S-089": { "Q1": 17, "A1": 2, "S1": 8 },
        "S-090": { "Q1": 13, "A1": 32, "S1": 6 },
        "S-091": { "Q1": 18, "A1": 15, "S1": 9 },
        "S-092": { "Q1": 16, "A1": 39, "S1": 7 },
        "S-093": { "Q1": 20, "A1": 29, "S1": 10 },
        "S-094": { "Q1": 14, "A1": 34, "S1": 6 },
        "S-095": { "Q1": 15, "A1": 37, "S1": 7 },
        "S-096": { "Q1": 20, "A1": 8, "S1": 10 },
        "S-097": { "Q1": 12, "A1": 29, "S1": 5 },
        "S-098": { "Q1": 16, "A1": 40, "S1": 8 },
        "S-099": { "Q1": 19, "A1": 17, "S1": 9 },
        "S-100": { "Q1": 14, "A1": 33, "S1": 6 }
    },
    "ALG-8-2": {
        "S-101": { "Q1": 18, "A1": 14 },
        "S-102": { "Q1": 15, "A1": 36 },
        "S-103": { "Q1": 19, "A1": 17 },
        "S-104": { "Q1": 17, "A1": 11 },
        "S-105": { "Q1": 20, "A1": 9 },
        "S-106": { "Q1": 12, "A1": 28 },
        "S-107": { "Q1": 20, "A1": 20 },
        "S-108": { "Q1": 16, "A1": 38 },
        "S-109": { "Q1": 19, "A1": 16 },
        "S-110": { "Q1": 17, "A1": 22 },
        "S-111": { "Q1": 14, "A1": 34 },
        "S-112": { "Q1": 18, "A1": 15 },
        "S-113": { "Q1": 16, "A1": 40 },
        "S-114": { "Q1": 20, "A1": 39 },
        "S-115": { "Q1": 15, "A1": 36 },
        "S-116": { "Q1": 17, "A1": 22 },
        "S-117": { "Q1": 18, "A1": 35 },
        "S-118": { "Q1": 13, "A1": 30 },
        "S-119": { "Q1": 20, "A1": 29 },
        "S-120": { "Q1": 14, "A1": 34 },
        "S-121": { "Q1": 18, "A1": 14 },
        "S-122": { "Q1": 20, "A1": 38 },
        "S-123": { "Q1": 13, "A1": 29 },
        "S-124": { "Q1": 17, "A1": 22 },
        "S-125": { "Q1": 19, "A1": 17 },
        "S-126": { "Q1": 14, "A1": 35 }
    },
    "GEO-9-1": {
        "S-127": { "Q1": 16, "S1": 8 },
        "S-128": { "Q1": 18, "S1": 9 },
        "S-129": { "Q1": 15, "S1": 7 },
        "S-130": { "Q1": 19, "S1": 9 },
        "S-131": { "Q1": 17, "S1": 8 },
        "S-132": { "Q1": 12, "S1": 5 },
        "S-133": { "Q1": 20, "S1": 10 },
        "S-134": { "Q1": 15, "S1": 7 },
        "S-135": { "Q1": 20, "S1": 10 },
        "S-136": { "Q1": 14, "S1": 6 },
        "S-137": { "Q1": 18, "S1": 9 },
        "S-138": { "Q1": 17, "S1": 8 },
        "S-139": { "Q1": 13, "S1": 6 },
        "S-140": { "Q1": 20, "S1": 10 },
        "S-141": { "Q1": 16, "S1": 8 },
        "S-142": { "Q1": 17, "S1": 8 },
        "S-143": { "Q1": 15, "S1": 7 },
        "S-144": { "Q1": 19, "S1": 9 },
        "S-145": { "Q1": 14, "S1": 7 },
        "S-146": { "Q1": 19, "S1": 10 },
        "S-147": { "Q1": 12, "S1": 5 },
        "S-148": { "Q1": 17, "S1": 8 },
        "S-149": { "Q1": 18, "S1": 9 },
        "S-150": { "Q1": 14, "S1": 6 },
        "S-151": { "Q1": 18, "S1": 9 },
        "S-152": { "Q1": 20, "S1": 10 },
        "S-153": { "Q1": 13, "S1": 6 },
        "S-154": { "Q1": 18, "S1": 9 },
        "S-155": { "Q1": 16, "S1": 7 },
        "S-156": { "Q1": 20, "S1": 10 },
        "S-157": { "Q1": 14, "S1": 6 },
        "S-158": { "Q1": 16, "S1": 8 },
        "S-159": { "Q1": 19, "S1": 9 },
        "S-160": { "Q1": 15, "S1": 7 },
        "S-161": { "Q1": 19, "S1": 10 }
    },
};

export const MOCK_QUARTERLY_ID = 'QTR-EXM';
export const MOCK_QUARTERLY_MAX = 100;

// --- Helper Functions ---

export function generateQuarterlyScore(studentId: string): number {
    const lastTwo = parseInt(studentId.slice(-2), 10);
    return 75 + (lastTwo % 20);
}

export function byCategory(activities: Activity[]): Map<string, Activity[]> {
    const map = new Map<string, Activity[]>();
    for (const a of activities) {
        if (!map.has(a.cat)) map.set(a.cat, []);
        map.get(a.cat)!.push(a);
    }
    return map;
}

export function to2(n: number | string): string { 
    return Number(n).toFixed(2); 
}

// Defining record for fixed section map to ensure keys match
export const FIXED_SECTION_MAP: Record<string, string[]> = {
    WW: ['Quizzes', 'Seatworks'],
    PT: ['Assignments'],
    QA: ['Quarterly'],
};

export interface SectionDefinition {
    id: string;
    label: string;
    category: string;
}

export const FIXED_SECTIONS: SectionDefinition[] = [
    { id: 'WW', label: 'Written Works', category: 'Quizzes' },
    { id: 'PT', label: 'Performance Tasks', category: 'Assignments' },
    { id: 'QA', label: 'Quarterly Assessment', category: 'Quarterly' },
];