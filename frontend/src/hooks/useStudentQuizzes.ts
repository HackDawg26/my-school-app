import { useQuery } from "@tanstack/react-query";
import { getStudentQuizzes } from "../api/studentApi";

export function useStudentQuizzes() {
  return useQuery({
    queryKey: ["student", "quizzes"],
    queryFn: getStudentQuizzes,
    staleTime: 5 * 60 * 1000,
  });
}