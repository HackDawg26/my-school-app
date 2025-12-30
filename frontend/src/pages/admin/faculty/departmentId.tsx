
'use client';
import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { teachers as initialTeachers, subjects, departments, sections } from "@/lib/data";
import type { Teacher, Section } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, MoreHorizontal, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EditFacultyDialog } from '@/components/layout/edit-faculty-dialog';

export default function DepartmentFacultyPage({ params }: { params: { departmentId: string }}) {
    const { departmentId } = use(params);
    const department = useMemo(() => departments.find(d => d.id === departmentId), [departmentId]);
    
    const [allTeachers, setAllTeachers] = useLocalStorage<Teacher[]>('teachers', initialTeachers);
    const [allSections] = useLocalStorage<Section[]>('sections', sections);

    const [teacherToRemove, setTeacherToRemove] = useState<Teacher | null>(null);
    const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const departmentTeachers = useMemo(() => {
        if (!departmentId || !Array.isArray(allTeachers)) return [];
        return allTeachers.filter(teacher => {
            if (!teacher.subjectIds || !Array.isArray(teacher.subjectIds)) return false;
            return teacher.subjectIds.some(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                return subject && subject.departmentId === departmentId;
            });
        }).sort((a, b) => a.lastName.localeCompare(b.lastName));
    }, [allTeachers, departmentId]);

    const removeTeacher = (teacherId: string) => {
        setAllTeachers(prev => prev.filter(t => t.id !== teacherId));
        toast({
            title: "Faculty Removed",
            description: `${teacherToRemove?.firstName} ${teacherToRemove?.lastName} has been removed.`,
        });
        setTeacherToRemove(null);
    };

    const handleUpdateTeacher = (updatedTeacher: Teacher) => {
        setAllTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
        setTeacherToEdit(null);
    };
    
    const getAdvisorySectionName = (teacher: Teacher) => {
        if (!teacher.adviserOfSectionId) return 'N/A';
        const section = allSections.find(s => s.id === teacher.adviserOfSectionId);
        return section ? `Grade ${section.yearLevel} - ${section.name}` : 'N/A';
    };

    if (!department) {
        return (
            <main className="flex-1 p-4 md:p-6 text-center">
                <h1 className="font-headline text-2xl font-bold">Department Not Found</h1>
                <Link href="/dashboard/faculty">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Faculty
                    </Button>
                </Link>
            </main>
        );
    }

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                 <Link href="/dashboard/faculty" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Departments
                </Link>
                <h1 className="font-headline text-3xl font-bold">{department.name} Department</h1>
                <p className="text-muted-foreground">List of faculty members.</p>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Last Name</TableHead>
                                <TableHead>First Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Advisory</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isClient ? (
                                departmentTeachers.map(teacher => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.lastName}</TableCell>
                                        <TableCell>{teacher.firstName}</TableCell>
                                        <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{getAdvisorySectionName(teacher)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => setTeacherToEdit(teacher)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit Advisory</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onSelect={() => setTeacherToRemove(teacher)} 
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        <span>Remove</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                             ) : (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="w-full h-5" /></TableCell>
                                        <TableCell><Skeleton className="w-full h-5" /></TableCell>
                                        <TableCell><Skeleton className="w-full h-5" /></TableCell>
                                        <TableCell><Skeleton className="w-full h-5" /></TableCell>
                                        <TableCell><Skeleton className="w-full h-5" /></TableCell>
                                    </TableRow>
                                ))
                             )}
                             {isClient && departmentTeachers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No faculty assigned to this department.
                                    </TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!teacherToRemove} onOpenChange={() => setTeacherToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove <span className="font-semibold">{teacherToRemove?.firstName} {teacherToRemove?.lastName}</span> from the faculty.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeTeacher(teacherToRemove!.id)} variant="destructive">
                            Yes, remove faculty
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {teacherToEdit && (
                <EditFacultyDialog
                    teacher={teacherToEdit}
                    sections={allSections}
                    onUpdateTeacher={handleUpdateTeacher}
                    isOpen={!!teacherToEdit}
                    setIsOpen={() => setTeacherToEdit(null)}
                />
            )}
        </main>
    );
}
