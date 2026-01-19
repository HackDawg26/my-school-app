import { useState } from 'react';

import ActivityList from './activity-list.tsx';
import SubjectActivityList from './subject-activity-list.tsx';
import ActivitySubmissions from './activity-submission.tsx';

const TeacherSubmissions = () => {
    // State to hold the currently selected subject object
    const [selectedSubject, setSelectedSubject] = useState(null); 
    
    // State to hold the currently selected activity object
    const [selectedActivity, setSelectedActivity] = useState(null);

    // If an activity is selected, show the TeacherSubmissions Table
    if (selectedActivity) {
        return <ActivitySubmissions 
            activity={selectedActivity} 
            onBack={() => setSelectedActivity(null)} 
        />;
    }
    
    // If a subject is selected, show the Activity List for that subject
    if (selectedSubject) {
        return <SubjectActivityList 
            subject={selectedSubject} 
            onSelectActivity={setSelectedActivity} 
            onBack={() => setSelectedSubject(null)}
        />;
    }

    // Default view: Show the list of all subjects
    return <ActivityList onSelectSubject={setSelectedSubject} />;
};

export default TeacherSubmissions;