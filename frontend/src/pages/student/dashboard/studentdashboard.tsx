
import { student, subjects } from "@/lib/data";
import { GpaCard } from "@/components/dashboard/gpa-card";
import { SubjectsOverview } from "@/components/dashboard/subjects-overview";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function Home() {
  const totalTasks = 15; // Mock data

  return (
    <main className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome, {student.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's your academic summary for today.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GpaCard gpa={student.gpa} />
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-headline">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">Across all semesters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-headline">{totalTasks}</div>
               <p className="text-xs text-muted-foreground">You're on a roll!</p>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <SubjectsOverview />
        </div>
        <div className="lg:col-span-1">
            <UpcomingDeadlines />
        </div>
      </div>
    </main>
  );
}
