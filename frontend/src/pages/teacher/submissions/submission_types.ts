export interface Activity {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  totalCount: number;
}

export interface ExtendedActivity extends Activity {
  pendingReviewCount: number;
  submittedCount: number;
}

export interface SubjectGroup {
  name: string;
  activities: ExtendedActivity[];
  totalSubmissions: number;
  totalPendingReview: number;
  totalActivities: number;
}
