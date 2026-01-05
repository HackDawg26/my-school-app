
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { assignments, type Assignment } from "../lib/data";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export function UpcomingDeadlines() {
    const [upcoming, setUpcoming] = useState<Assignment[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const now = new Date();
        const upcomingAssignments = assignments
            .filter(a => a.status !== 'Submitted' && new Date(a.dueDate) > now)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5); // Show 5 instead of 4
        setUpcoming(upcomingAssignments);
    }, []);

    const getBadgeVariant = (dueDate: string) => {
        const daysLeft = (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        if (daysLeft < 3) return "destructive";
        if (daysLeft < 7) return "secondary";
        return "outline";
    };

    if (!isClient) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="font-headline">Upcoming Deadlines</CardTitle>
                    <CardDescription>Don't miss these important dates!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full animate-pulse bg-muted rounded-md" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline">Upcoming Deadlines</CardTitle>
                <CardDescription>Don't miss these important dates!</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead className="text-right">Due</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {upcoming.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-sm text-muted-foreground">{task.subjectName}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`whitespace-nowrap ${getBadgeVariant(task.dueDate)}`}>
                                        {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
