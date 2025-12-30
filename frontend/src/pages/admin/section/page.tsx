
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { sections as initialSections, teachers as initialTeachers } from "@/lib/data";
import type { Section, Teacher } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function SectionsPage() {
    const [sections] = useLocalStorage<Section[]>('sections', initialSections);
    const [teachers] = useLocalStorage<Teacher[]>('teachers', initialTeachers);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const groupedSections = sections.reduce((acc, section) => {
        const year = `Grade ${section.yearLevel}`;
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(section);
        return acc;
    }, {} as Record<string, typeof sections>);

    const sortedYearLevels = Object.keys(groupedSections).sort((a, b) => {
        const yearA = parseInt(a.replace('Grade ', ''));
        const yearB = parseInt(b.replace('Grade ', ''));
        return yearA - yearB;
    });

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Sections</h1>
                <p className="text-muted-foreground">List of all sections and their assigned advisers.</p>
            </div>
            
            <div className="space-y-8">
                 {sortedYearLevels.map(yearLevel => (
                    <div key={yearLevel}>
                        <h2 className="font-headline text-2xl font-semibold mb-4">{yearLevel}</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {groupedSections[yearLevel].map((section) => {
                                const adviser = teachers.find(t => t.id === section.adviserId);
                                const adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : 'Unassigned';

                                return (
                                     <Link href={`/dashboard/sections/${section.id}/subjects`} key={section.id} className="group">
                                        <Card className="flex flex-col h-full group-hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="font-headline text-xl">Section {section.name}</CardTitle>
                                                <CardDescription>
                                                    Adviser: {isClient ? adviserName : <Skeleton className="h-4 w-24 inline-block" />}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1 flex flex-col justify-end">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Building className="mr-2 h-4 w-4" />
                                                    <span>Grade {section.yearLevel}</span>
                                                </div>
                                                <div className="flex items-center justify-end text-sm font-medium text-primary mt-4">
                                                    Manage Subjects
                                                    <ArrowRight className="ml-2 h-4 w-4 transform-gpu transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
