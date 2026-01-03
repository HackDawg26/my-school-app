
'use client';
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../../components/components/card";
import { useLocalStorage } from "../../../components/hooks/use-local-storage";
import {
  teachers as initialTeachers,
  subjects,
  departments,
  sections
} from "../../../components/lib/data";
import type { Teacher } from "../../../components/lib/types";
import { AddFacultyDialog } from "../../../components/components/add-faculty-dialog";
import { Users, ArrowRight } from "lucide-react";
import { Skeleton } from "../../../components/components/skeleton";
import { cn } from "../../../components/lib/utils";

export default function FacultyPage() {
    const [teachers, setTeachers] = useLocalStorage<Teacher[]>('teachers', initialTeachers);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
        const newTeacher: Teacher = {
            id: `TCH-${Math.floor(100 + Math.random() * 900)}`,
            password: `pw${Math.floor(1000 + Math.random() * 9000)}`,
            ...teacher,
        };
        setTeachers(prev => [...prev, newTeacher].sort((a, b) => a.lastName.localeCompare(b.lastName)));
    };

    const teachersByDepartment = useMemo(() => {
        const mapping: Record<string, Teacher[]> = {};
        departments.forEach(dept => {
            mapping[dept.id] = [];
        });

        if (Array.isArray(teachers)) {
            teachers.forEach(teacher => {
                const departmentIds = new Set<string>();
                if (teacher.subjectIds && Array.isArray(teacher.subjectIds)) {
                    teacher.subjectIds.forEach(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        if (subject && subject.departmentId) {
                            departmentIds.add(subject.departmentId);
                        }
                    });
                }
                
                departmentIds.forEach(deptId => {
                    if (mapping[deptId] && !mapping[deptId].find(t => t.id === teacher.id)) {
                        mapping[deptId].push(teacher);
                    }
                });
            });
        }
        return mapping;
    }, [teachers]);

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Faculty Accounts</h1>
                    <p className="text-muted-foreground">Select a department to view and manage faculty accounts.</p>
                </div>
                <AddFacultyDialog onAddTeacher={addTeacher} sections={sections} />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map(department => {
                     const facultyCount = isClient ? (teachersByDepartment[department.id]?.length || 0) : 0;
                     return (
                        <Link href={`/dashboard/faculty/${department.id}`} key={department.id} className="group">
                            <Card className="flex flex-col h-full group-hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">{department.name}</CardTitle>
                                    <CardDescription>Department</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        {isClient ? (
                                            <span>{facultyCount} Faculty</span>
                                        ) : (
                                            <Skeleton className="h-4 w-20" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end text-sm font-medium text-primary mt-4">
                                        View Faculty List
                                        <ArrowRight className="ml-2 h-4 w-4 transform-gpu transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </main>
    );
}
