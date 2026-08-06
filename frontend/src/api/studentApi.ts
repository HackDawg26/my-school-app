import type {StudentProfile} from "../pages/student/student_types/portal";


export async function getStudentProfile(): Promise<StudentProfile> {
    const token = localStorage.getItem("access");

    if (!token){
        throw new Error(
            "Access token not found."
        )
    }

    const response = await fetch(
        "http://127.0.0.1:8000/api/student/profile/",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch student profile: ${response.statusText}`
        );
    }

    return response.json();

}