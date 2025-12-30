
'use client';
import React, { useState, useEffect } from 'react';
import type { Teacher, Section } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditFacultyDialogProps {
    teacher: Teacher;
    sections: Section[];
    onUpdateTeacher: (teacher: Teacher) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const EditFacultyDialog = ({ teacher, sections, onUpdateTeacher, isOpen, setIsOpen }: EditFacultyDialogProps) => {
    const { toast } = useToast();
    const [adviserOfSectionId, setAdviserOfSectionId] = useState<string | undefined>(teacher.adviserOfSectionId);

    useEffect(() => {
        setAdviserOfSectionId(teacher.adviserOfSectionId);
    }, [teacher]);

    const handleSubmit = () => {
        onUpdateTeacher({
            ...teacher,
            adviserOfSectionId: adviserOfSectionId,
        });

        toast({
            title: 'Advisory Class Updated',
            description: `${teacher.firstName} ${teacher.lastName}'s advisory class has been updated.`,
        });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Advisory Class</DialogTitle>
                    <DialogDescription>
                        Change the advisory class for {teacher.firstName} {teacher.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="adviser" className="text-right">Advisory</Label>
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
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
