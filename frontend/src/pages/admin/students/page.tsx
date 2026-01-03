
'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../../components/components/card";
import {
  sections as initialSections,
  students as initialStudents,
  teachers
} from "../../../components/lib/data";
import type { Student, Section } from "../../../components/lib/types";
import { Button } from "../../../components/components/button";
import { PlusCircle, FileUp, FileDown, Users, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "../../../components/components/dialog";
import { Input } from "../../../components/components/input";
import { Label } from "../../../components/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/components/select";
import { useToast } from "../../../components/hooks/use-toast";
import { useLocalStorage } from "../../../components/hooks/use-local-storage";
import { Skeleton } from "../../../components/components/skeleton";
import { cn } from "../../../components/lib/utils";

const AddStudentDialog = ({ sections, onAddStudent }: { sections: Section[], onAddStudent: (student: Omit<Student, 'id'>) => void }) => {
    const { toast } = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = () => {
        if (!firstName || !lastName || !sectionId) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide first name, last name, and a section.',
            });
            return;
        }

        const email = `${firstName.charAt(0).toLowerCase()}.${lastName.toLowerCase().replace(/ /g, '')}@claroed.edu`;

        onAddStudent({
            firstName,
            lastName,
            sectionId,
            email,
            password: `pw${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'Active',
        });
        toast({
            title: 'Student Added',
            description: `${firstName} ${lastName} has been successfully added.`,
        });
        setIsOpen(false);
        setFirstName('');
        setLastName('');
        setSectionId('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>Enter the details for the new student.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="firstName" className="text-right">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastName" className="text-right">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="section" className="text-right">Section</Label>
                        <Select onValueChange={setSectionId} value={sectionId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map(s => <SelectItem key={s.id} value={s.id}>Grade {s.yearLevel} - {s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Add Student</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const AddSectionDialog = () => {
    const { toast } = useToast();
    const handleClick = () => {
        toast({
            title: `Add Section Functionality`,
            description: `This feature is not yet implemented.`,
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><PlusCircle className="mr-2" /> Add Section</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>
                        This feature allows you to add a new section.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">This functionality is a placeholder for demonstration purposes.</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleClick}>Acknowledge</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ImportExportDialog = ({ variant }: { variant: 'Import' | 'Export' }) => {
    const { toast } = useToast();
    const handleClick = () => {
        toast({
            title: `${variant} Functionality`,
            description: `This feature is not yet implemented.`,
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    {variant === 'Import' ? <FileUp className="mr-2" /> : <FileDown className="mr-2" />}
                    {variant} Classlist
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{variant} Classlist</DialogTitle>
                    <DialogDescription>
                        This feature allows you to bulk {variant.toLowerCase()} student data using a spreadsheet file.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">This functionality is a placeholder for demonstration purposes.</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleClick}>Acknowledge</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function StudentsPage() {
    const [students, setStudents] = useLocalStorage<Student[]>('students', initialStudents);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Ensure passwords exist on client-side to avoid hydration mismatch
        setStudents(prevStudents => 
            prevStudents.map(s => ({
                ...s,
                password: s.password || `pw${Math.floor(1000 + Math.random() * 9000)}`
            }))
        );
    }, []);

    const addStudent = (student: Omit<Student, 'id'>) => {
        const newStudent: Student = {
            id: `STU-${Math.floor(100 + Math.random() * 900)}`,
            ...student,
        };
        setStudents(prev => [...prev, newStudent].sort((a, b) => a.lastName.localeCompare(b.lastName)));
    };

    const groupedSections = initialSections.reduce((acc, section) => {
        const year = `Grade ${section.yearLevel}`;
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(section);
        return acc;
    }, {} as Record<string, typeof initialSections>);

    const sortedYearLevels = Object.keys(groupedSections).sort((a, b) => {
        const yearA = parseInt(a.replace('Grade ', ''));
        const yearB = parseInt(b.replace('Grade ', ''));
        return yearA - yearB;
    });

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Student Accounts</h1>
                    <p className="text-muted-foreground">Select a section to view and manage student accounts.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ImportExportDialog variant="Import" />
                    <ImportExportDialog variant="Export" />
                    <AddSectionDialog />
                    <AddStudentDialog sections={initialSections} onAddStudent={addStudent} />
                </div>
            </div>
            
            <div className="space-y-8">
                {sortedYearLevels.map(yearLevel => (
                    <div key={yearLevel}>
                        <h2 className="font-headline text-2xl font-semibold mb-4">{yearLevel}</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {groupedSections[yearLevel].map((section) => {
                                const sectionStudents = isClient ? students.filter(s => s.sectionId === section.id) : [];
                                const studentCount = sectionStudents.length;
                                const adviser = teachers.find(t => t.id === section.adviserId);
                                const adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : 'Unassigned';

                                return (
                                    <Link href={`/dashboard/students/${section.id}`} key={section.id} className="group">
                                        <Card className="flex flex-col h-full group-hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="font-headline text-xl">Section {section.name}</CardTitle>
                                                <CardDescription>
                                                    Adviser: {isClient ? adviserName : <Skeleton className="h-4 w-24 inline-block" />}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1 flex flex-col justify-end">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Users className="mr-2 h-4 w-4" />
                                                    {isClient ? (
                                                      <span>{studentCount} Students</span>
                                                    ) : (
                                                      <Skeleton className="h-4 w-20" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-end text-sm font-medium text-primary mt-4">
                                                    View Class List
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

    
