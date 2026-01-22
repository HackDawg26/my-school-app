import { useState } from "react";
import ActivityList from "./activity-list";
import SubjectActivityList from "./subject-activity-list";
import ActivitySubmissions from "./activity-submission";
import type { ExtendedActivity, SubjectGroup } from "./submission_types";


/** Types must match ActivityList + SubjectActivityList */


const TeacherSubmissions = () => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectGroup | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ExtendedActivity | null>(null);

  if (selectedActivity) {
    return (
      <ActivitySubmissions
        activity={selectedActivity}
        onBack={() => setSelectedActivity(null)}
      />
    );
  }

  if (selectedSubject) {
    return (
      <SubjectActivityList
        subject={selectedSubject}
        onSelectActivity={setSelectedActivity}
        onBack={() => setSelectedSubject(null)}
      />
    );
  }

  return <ActivityList onSelectSubject={setSelectedSubject} />;
};

export default TeacherSubmissions;
