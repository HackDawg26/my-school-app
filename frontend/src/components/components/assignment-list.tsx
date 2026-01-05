
'use client';

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { format } from "date-fns";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { AssignmentSubmitForm } from "./assignment-submit-form";
import { Upload } from "lucide-react/dist/lucide-react";
import type { Assignment } from "../lib/types";

function AssignmentRow({ assignment }: { assignment: Assignment }) {
    const [open, setOpen] = useState(false);
    
    const getBadgeVariant = (status: string) => {
        if (status === 'Submitted') return "default";
        if (status === 'Late') return "destructive";
        return "secondary";
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{assignment.title}</TableCell>
            <TableCell>{format(new Date(assignment.dueDate), 'PPP')}</TableCell>
            <TableCell>
                <Badge variant={getBadgeVariant(assignment.status)}>{assignment.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
                {assignment.status === 'Not Submitted' && (
                     <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Submit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit: {assignment.title}</DialogTitle>
                            </DialogHeader>
                            <AssignmentSubmitForm assignment={assignment} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                )}
            </TableCell>
        </TableRow>
    );
}

export function AssignmentList({ subjectAssignments }: { subjectAssignments: Assignment[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subjectAssignments.map(assignment => (
                    <AssignmentRow key={assignment.id} assignment={assignment} />
                ))}
            </TableBody>
        </Table>
    );
}
