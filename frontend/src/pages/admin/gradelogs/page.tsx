
'use client';
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { gradeLogs } from '@/lib/data';

export default function GradeLogsPage() {
    const getChangeTypeChipClassName = (changeType: string) => {
        switch (changeType) {
            case 'Create':
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Update':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            default:
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        }
    }

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Grade Change Logs</h1>
                <p className="text-muted-foreground">A record of all grade modifications made by teachers.</p>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Activity</TableHead>
                                <TableHead>Previous Grade</TableHead>
                                <TableHead>New Grade</TableHead>
                                <TableHead>Change Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradeLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                                    <TableCell className="font-medium">{log.teacher}</TableCell>
                                    <TableCell>{log.student}</TableCell>
                                    <TableCell>{log.subject}</TableCell>
                                    <TableCell>{log.activity}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{log.previousGrade}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.newGrade}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-block rounded-full px-2 py-1 text-xs font-semibold", 
                                            getChangeTypeChipClassName(log.changeType)
                                        )}>
                                            {log.changeType}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
