
import { ActivityList } from "../../../components/components/activity-list";
import { quizzes as activities } from "../../../components/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/components/card";

export default function ActivitiesPage() {
    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Activities</h1>
                <p className="text-muted-foreground">Review and take activities for all your subjects.</p>
            </div>
             <Card>
                <CardContent className="pt-6">
                    <ActivityList subjectActivities={activities} />
                </CardContent>
            </Card>
        </main>
    );
}
