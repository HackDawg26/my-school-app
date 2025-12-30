
'use client';
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowLeft, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { sections, students as initialStudents } from "@/lib/data";
import type { Student } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


export default function SectionRosterPage({ params }: { params: { sectionId: string }}) {
    const { sectionId } = use(params);
    const section = sections.find(s => s.id === sectionId);

    const [allStudents, setAllStudents] = useLocalStorage<Student[]>('students', initialStudents);
    const [isClient, setIsClient] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const students = allStudents.filter(s => s.sectionId === sectionId);

    const handleStatusChange = (studentId: string, newStatus: boolean) => {
        setAllStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus ? 'Active' : 'Inactive' } : s));
    };

    const removeStudent = (studentId: string) => {
        setAllStudents(prev => prev.filter(s => s.id !== studentId));
        toast({
            title: "Student Removed",
            description: `${studentToRemove?.firstName} ${studentToRemove?.lastName} has been removed from the section.`,
        });
        setStudentToRemove(null);
    };

    if (!section) {
        return (
            <main className="flex-1 p-4 md:p-6 text-center">
                <h1 className="font-headline text-2xl font-bold">Section Not Found</h1>
                <Link href="/dashboard/students">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Students
                    </Button>
                </Link>
            </main>
        );
    }
    
    const backLink = "/dashboard/students";
    const backLinkText = "Back to All Sections";

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                 <Link href={backLink} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {backLinkText}
                </Link>
                <h1 className="font-headline text-3xl font-bold">Grade {section.yearLevel} - Section {section.name}</h1>
                <p className="text-muted-foreground">Student Class List</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Students ({isClient ? students.length : '...'})</CardTitle>
                    <CardDescription>List of all students enrolled in this section.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>First Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isClient && students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.id}</TableCell>
                                    <TableCell>{student.lastName}</TableCell>
                                    <TableCell>{student.firstName}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.password || '...'}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.status === 'Active' ? 'success' : 'destructive'}>
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                                                    <Label htmlFor={`status-${student.id}`}>{student.status === 'Active' ? 'Active' : 'Inactive'}</Label>
                                                    <Switch 
                                                        id={`status-${student.id}`}
                                                        checked={student.status === 'Active'}
                                                        onCheckedChange={(checked) => handleStatusChange(student.id, checked)}
                                                    />
                                                </div>
                                                <DropdownMenuItem onSelect={() => setStudentToRemove(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    Remove Student
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove <span className="font-semibold">{studentToRemove?.firstName} {studentToRemove?.lastName}</span> from the section.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeStudent(studentToRemove!.id)} variant="destructive">
                            Yes, remove student
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </main>
    )
}
