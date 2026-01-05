
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { Button } from "./button";
import { PlayCircle } from "lucide-react/dist/lucide-react";
import type { Quiz } from "../lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState } from "react";
import { format } from "date-fns";

function QuizRow({ quiz }: { quiz: Quiz }) {
    const { toast } = useToast();

    const handleStartQuiz = () => {
        toast({
            title: "Quiz Started!",
            description: `You have ${quiz.timeLimit} minutes to complete "${quiz.title}". Good luck!`,
        });
        // Here you would navigate to the quiz page.
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                toast({
                    variant: "destructive",
                    title: "Tab Change Detected!",
                    description: "You have been flagged for switching tabs during a quiz.",
                })
            }
        };

        // This is a simplified example. In a real app, you'd only add this listener 
        // when a quiz is active.
        // For now, let's disable it to prevent it from firing on any tab change.
        // document.addEventListener("visibilitychange", handleVisibilityChange);

        // return () => {
        //     document.removeEventListener("visibilitychange", handleVisibilityChange);
        // };
    }, [toast]);


    const getBadgeVariant = (status: string) => {
        if (status === 'Completed') return "default";
        return "secondary";
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{quiz.title}</TableCell>
            <TableCell>{format(new Date(quiz.dueDate), 'PPP')}</TableCell>
            <TableCell>{quiz.timeLimit} Minutes</TableCell>
            <TableCell>
                <Badge variant={getBadgeVariant(quiz.status)}>{quiz.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
                {quiz.status === 'Not Taken' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Start Quiz
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you ready to start the quiz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This quiz has {quiz.questions} questions. You will have {quiz.timeLimit} minutes to complete it. You cannot pause the timer once you begin.
                                    <br/><br/>
                                    <strong className="text-destructive">Important:</strong> Do not switch tabs or windows while taking the quiz, as this will be flagged.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleStartQuiz}>Start Quiz</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </TableCell>
        </TableRow>
    );
}

export function QuizList({ subjectQuizzes }: { subjectQuizzes: Quiz[] }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="h-40 w-full animate-pulse bg-muted rounded-md" />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subjectQuizzes.map(quiz => (
                    <QuizRow key={quiz.id} quiz={quiz} />
                ))}
            </TableBody>
        </Table>
    );
}
