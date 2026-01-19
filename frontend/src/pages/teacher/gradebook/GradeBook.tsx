import React, { type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubjectChooser from './SubjectChooser';
import { ComplexGradebookTable } from './GbTable';

/**
 * Type definition for the URL parameters used in this route.
 */
type GradebookParams = {
    subjectId?: string;
};

export default function Gradebook(): JSX.Element {
    // useParams is generic; we tell it to expect our subjectId string
    const { subjectId } = useParams<GradebookParams>(); 
    const navigate = useNavigate();

    const handleBack = (): void => {
        // Navigates back to the root gradebook path to clear the subjectId
        navigate('/teacher/gradebook'); 
    };

    if (subjectId) {
        // If there's a subjectId in the URL, show the gradebook table
        return (
            <ComplexGradebookTable 
                selected={subjectId} 
                onBack={handleBack} 
            />
        );
    }

    // Otherwise, show the subject chooser
    return <SubjectChooser />;
}