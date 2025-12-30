
import { TaskList } from "@/components/subjects/task-list";
import { assignments as tasks } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TasksPage() {
    return (
        <main className="flex-1 p-4 md:p-6">
             <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Tasks</h1>
                <p className="text-muted-foreground">Browse and submit all your tasks from one place.</p>
            </div>
             <Card>
                <CardContent className="pt-6">
                    <TaskList subjectTasks={tasks} />
                </CardContent>
            </Card>
        </main>
    );
}
