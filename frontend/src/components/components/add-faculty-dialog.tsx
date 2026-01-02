
'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { subjects } from "../lib/data";
import type { Teacher, Section } from '../lib/types';
import { PlusCircle } from "lucide-react";
import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { useToast } from '../../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Checkbox } from './checkbox';

export const AddFacultyDialog = ({ onAddTeacher, sections }: { onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void, sections: Section[] }) => {
    const { toast } = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [subjectIds, setSubjectIds] = useState<string[]>([]);
    const [adviserOfSectionId, setAdviserOfSectionId] = useState<string | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = () => {
        if (!firstName || !lastName) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide first name and last name.',
            });
            return;
        }

        onAddTeacher({
            firstName,
            lastName,
            // Safely format the email
            email: `${firstName.trim().charAt(0).toLowerCase()}.${lastName.trim().toLowerCase().replace(/\s+/g, '')}@claroed.edu`,
            
            // Generate password
            password: `pw${Math.floor(1000 + Math.random() * 9000)}`,
            
            // Ensure arrays and IDs are handled
            subjectIds: subjectIds || [],
            adviserOfSectionId: adviserOfSectionId || null,
        });

        toast({
            title: 'Faculty Added',
            description: `${firstName} ${lastName} has been successfully added.`,
        });
        setIsOpen(false);
        // Reset form
        setFirstName('');
        setLastName('');
        setSubjectIds([]);
        setAdviserOfSectionId(undefined);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2" /> Add Faculty</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Faculty</DialogTitle>
                    <DialogDescription>Enter the details for the new faculty member.</DialogDescription>
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
                        <Label htmlFor="subjects" className="text-right">Subjects</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="col-span-3 justify-start">
                                    {subjectIds.length > 0 ? `${subjectIds.length} selected` : "Select subjects"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                               <div className="p-2 space-y-1">
                                 {subjects.map(subject => (
                                    <div key={subject.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                                        <Checkbox 
                                            id={`subject-${subject.id}`}
                                            checked={subjectIds.includes(subject.id)}
                                            onCheckedChange={(checked) => {
                                                setSubjectIds(prev => checked ? [...prev, subject.id] : prev.filter(id => id !== subject.id))
                                            }}
                                        />
                                        <Label htmlFor={`subject-${subject.id}`} className="font-normal">{subject.name}</Label>
                                    </div>
                                 ))}
                               </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="adviser" className="text-right">Adviser</Label>
                        <Select onValueChange={(value) => setAdviserOfSectionId(value === 'none' ? undefined : value)} value={adviserOfSectionId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {sections.map(s => <SelectItem key={s.id} value={s.id}>Grade {s.yearLevel} - {s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Add Faculty</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
