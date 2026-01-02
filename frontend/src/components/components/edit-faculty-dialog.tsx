'use client';
import { useState, useEffect } from 'react';
import type { Teacher, Section } from '../lib/types';
import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from './dialog';
import { Label } from './label';
import { useToast } from '../../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface EditFacultyDialogProps {
    teacher: Teacher;
    sections: Section[];
    onUpdateTeacher: (teacher: Teacher) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const EditFacultyDialog = ({ teacher, sections, onUpdateTeacher, isOpen, setIsOpen }: EditFacultyDialogProps) => {
    const { toast } = useToast();
    
    // Initialize with "none" string to ensure Select component value matches properly
    const [adviserOfSectionId, setAdviserOfSectionId] = useState<string>(teacher.adviserOfSectionId || "none");

    // Re-sync state when teacher changes or dialog opens
    useEffect(() => {
        if (isOpen) {
            setAdviserOfSectionId(teacher.adviserOfSectionId || "none");
        }
    }, [teacher, isOpen]);

    const handleSubmit = () => {
        onUpdateTeacher({
            ...teacher,
            // Convert "none" back to undefined for your database/backend
            adviserOfSectionId: adviserOfSectionId === "none" ? undefined : adviserOfSectionId,
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
                        Assign or change the advisory class for {teacher.firstName} {teacher.lastName}.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="adviser">Advisory Section</Label>
                        <Select 
                            onValueChange={setAdviserOfSectionId} 
                            value={adviserOfSectionId}
                        >
                            <SelectTrigger id="adviser" className="w-full">
                                <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (No Advisory)</SelectItem>
                                {sections.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        Grade {s.yearLevel} - {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}