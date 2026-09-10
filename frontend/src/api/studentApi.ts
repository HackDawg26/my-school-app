import type {
    StudentProfile, 
    StudentSubjectOffering, 
    StudentQuiz,
    StudentSubjectFile
} from "../types/studentTypes";
import { authFetch } from "./apiClient";



export async function getStudentProfile(): Promise<StudentProfile> {
   const response = await authFetch("/student/profile/",{
        method: "GET",
   });

    return response.json();

}

export async function getStudentSubjects(): Promise<StudentSubjectOffering[]>{
    const response = await authFetch("/student/subject-offerings/", {
        method: "GET",
    });

    return response.json();
}

export async function getStudentSubject(offeringId: number): Promise<StudentSubjectOffering> {
    const response = await authFetch(
        `/student/subject-offerings/${offeringId}/`,
        {
            method: "GET",
        }
    );

    return response.json();
}

export async function getStudentQuizzes(): Promise<StudentQuiz[]> {
  const response = await authFetch("/student/quizzes/", {
    method: "GET",
  });

  return response.json();
}

export async function getStudentSubjectQuizzes(
  offeringId: number
): Promise<StudentQuiz[]> {
  const response = await authFetch(
    `/student/subject-offerings/${offeringId}/quizzes/`,
    {
      method: "GET",
    }
  );

  return response.json();
}

export async function getStudentSubjectFiles(
  offeringId: number
): Promise<StudentSubjectFile[]> {
  const response = await authFetch(
    `/student/subject-offerings/${offeringId}/files/`,
    {
      method: "GET",
    }
  );

  return response.json();
}