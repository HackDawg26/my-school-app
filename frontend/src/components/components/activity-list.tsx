
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { Button } from "./button";
import { PlayCircle } from "lucide-react";
import type { Quiz as Activity } from "../lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

function ActivityRow({ activity }: { activity: Activity }) {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleStartActivity = () => {
        toast({
            title: "Activity Started!",
            description: `You have ${activity.timeLimit} minutes to complete "${activity.title}". Good luck!`,
        });
        // Here you would navigate to the activity page.
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                toast({
                    variant: "destructive",
                    title: "Tab Change Detected!",
                    description: "You have been flagged for switching tabs during an activity.",
                })
            }
        };

        // This is a simplified example. In a real app, you'd only add this listener 
        // when an activity is active.
        // For now, let's disable it to prevent it from firing on any tab change.
        // document.addEventListener("visibilitychange", handleVisibilityChange);

        // return () => {
        //     document.removeEventListener("visibilitychange", handleVisibilityChange);
        // };
    }, [toast]);


    const getBadgeVariant = (status: Activity['status']) => {
        if (status === 'Completed') return "success";
        if (status === 'Not Taken') return "warning";
        return "secondary";
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{activity.title}</TableCell>
            <TableCell>{activity.subjectName}</TableCell>
            <TableCell>{activity.type}</TableCell>
            <TableCell>{isClient ? format(new Date(activity.dueDate), 'PPP') : ''}</TableCell>
            <TableCell>{activity.timeLimit} Minutes</TableCell>
            <TableCell>
                <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
                {activity.status === 'Not Taken' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Start Activity
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you ready to start the activity?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This activity has {activity.questions} questions. You will have {activity.timeLimit} minutes to complete it. You cannot pause the timer once you begin.
                                    <br/><br/>
                                    <strong className="text-destructive">Important:</strong> Do not switch tabs or windows while taking the activity, as this will be flagged.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleStartActivity}>Start Activity</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </TableCell>
        </TableRow>
    );
}

export function ActivityList({ subjectActivities }: { subjectActivities: Activity[] }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sortedActivities = useMemo(() => {
        return [...subjectActivities].sort((a, b) => {
            if (a.status === 'Completed' && b.status !== 'Completed') {
                return 1;
            }
            if (a.status !== 'Completed' && b.status === 'Completed') {
                return -1;
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [subjectActivities]);

    if (!isClient) {
        return <div className="h-40 w-full animate-pulse bg-muted rounded-md" />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedActivities.map(activity => (
                    <ActivityRow key={activity.id} activity={activity} />
                ))}
            </TableBody>
        </Table>
    );
}
