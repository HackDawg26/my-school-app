
'use client';
import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Link as LinkIcon, Save, ExternalLink } from 'lucide-react';
import { sections, subjects, teachers, assignments } from "@/lib/data";
import type { SectionSubjectLink } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

export default function SectionSubjectsPage({ params }: { params: { sectionId: string }}) {
    const { sectionId } = use(params);
    const { toast } = useToast();
    
    const section = useMemo(() => sections.find(s => s.id === sectionId), [sectionId]);

    const [links, setLinks] = useLocalStorage<SectionSubjectLink[]>('sectionSubjectLinks', []);
    
    const [localLinks, setLocalLinks] = useState<Record<string, string>>(() => {
        const initialLinks: Record<string, string> = {};
        if (typeof window !== 'undefined') {
            const storedLinks = localStorage.getItem('sectionSubjectLinks');
            if (storedLinks) {
                const parsedLinks: SectionSubjectLink[] = JSON.parse(storedLinks);
                parsedLinks.filter(l => l.sectionId === sectionId).forEach(l => {
                    initialLinks[l.subjectId] = l.teamLink;
                });
            }
        }
        return initialLinks;
    });

    const sectionAssignments = useMemo(() => assignments.filter(a => a.sectionId === sectionId && a.subjectId !== 'SUB-00'), [sectionId]);

    const handleLinkChange = (subjectId: string, value: string) => {
        setLocalLinks(prev => ({
            ...prev,
            [subjectId]: value
        }));
    };

    const handleSaveLink = (subjectId: string) => {
        const newLink: SectionSubjectLink = {
            sectionId,
            subjectId,
            teamLink: localLinks[subjectId] || ''
        };
        
        setLinks(prevLinks => {
            const existingLinkIndex = prevLinks.findIndex(l => l.sectionId === sectionId && l.subjectId === subjectId);
            if (existingLinkIndex > -1) {
                const updatedLinks = [...prevLinks];
                updatedLinks[existingLinkIndex] = newLink;
                return updatedLinks;
            } else {
                return [...prevLinks, newLink];
            }
        });

        toast({
            title: "Link Saved",
            description: `The team link for the subject has been saved.`,
        });
    };

    if (!section) {
        return (
            <main className="flex-1 p-4 md:p-6 text-center">
                <h1 className="font-headline text-2xl font-bold">Section Not Found</h1>
                <Link href="/dashboard/sections">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sections
                    </Button>
                </Link>
            </main>
        );
    }

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                 <Link href="/dashboard/sections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Sections
                </Link>
                <h1 className="font-headline text-3xl font-bold">Grade {section.yearLevel} - Section {section.name}</h1>
                <p className="text-muted-foreground">Manage Subjects & Team Links</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Subjects</CardTitle>
                    <CardDescription>View assigned teachers and manage team links for each subject.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Assigned Teacher</TableHead>
                                <TableHead>Team Link (Admin Edit)</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectionAssignments.map(assignment => {
                                const subject = subjects.find(s => s.id === assignment.subjectId);
                                const teacher = teachers.find(t => t.id === assignment.teacherId);
                                const link = localLinks[assignment.subjectId] || '';

                                if (!subject) return null;

                                return (
                                    <TableRow key={assignment.subjectId}>
                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                        <TableCell>{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    type="url" 
                                                    placeholder="Teacher to provide link or admin override..." 
                                                    value={link}
                                                    onChange={(e) => handleLinkChange(subject.id, e.target.value)}
                                                />
                                                 {link && (
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" aria-label="Open link in new tab">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handleSaveLink(subject.id)}>
                                                <Save className="mr-2 h-4 w-4"/>
                                                Save Link
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
