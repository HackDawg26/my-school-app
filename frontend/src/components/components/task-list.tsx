
'use client';

import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { format } from "date-fns";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { TaskSubmitForm } from "./task-submit-form";
import { Upload } from "lucide-react/dist/lucide-react";
import type { Assignment as Task } from "../lib/types";

function TaskRow({ task }: { task: Task }) {
    const [open, setOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const getBadgeVariant = (status: Task['status']) => {
        if (status === 'Submitted') return "success";
        if (status === 'Late') return "destructive";
        if (status === 'Not Submitted') return "warning";
        return "secondary";
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>{task.subjectName}</TableCell>
            <TableCell>{task.type}</TableCell>
            <TableCell>{isClient ? format(new Date(task.dueDate), 'PPP') : ''}</TableCell>
            <TableCell>
                <Badge variant={getBadgeVariant(task.status)}>{task.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
                {task.status !== 'Submitted' && (
                     <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Submit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit: {task.title}</DialogTitle>
                            </DialogHeader>
                            <TaskSubmitForm task={task} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                )}
            </TableCell>
        </TableRow>
    );
}

export function TaskList({ subjectTasks }: { subjectTasks: Task[] }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

     const sortedTasks = useMemo(() => {
        return [...subjectTasks].sort((a, b) => {
            if (a.status === 'Submitted' && b.status !== 'Submitted') {
                return 1;
            }
            if (a.status !== 'Submitted' && b.status === 'Submitted') {
                return -1;
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [subjectTasks]);


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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedTasks.map(task => (
                    <TaskRow key={task.id} task={task} />
                ))}
            </TableBody>
        </Table>
    );
}
