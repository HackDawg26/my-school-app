'use client';

import { useParams, notFound } from 'next/navigation';
import { subjects, assignments, quizzes, resources } from '@/lib/data';
import { cn, getSubjectColors } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TaskList } from '@/components/subjects/task-list';
import { ActivityList } from '@/components/subjects/activity-list';
import { ResourceList } from '@/components/subjects/resource-list';

export default function SubjectPage() {
    const params = useParams();
    const subject = subjects.find(s => s.id === params.id);

    if (!subject) {
        notFound();
    }

    const { textColor } = getSubjectColors(subject.color);

    const subjectTasks = assignments.filter(a => a.subjectId === subject.id);
    const subjectActivities = quizzes.filter(q => q.subjectId === subject.id);
    const subjectResources = resources.filter(r => r.subjectId === subject.id);

    return (
        <main className="p-4 md:p-6">
             <div className="flex items-center gap-4 mb-6">
                <Link href="/subjects">
                    <Button variant="outline" size="sm" aria-label="Back to subjects">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-full", subject.color)} />
                    <div>
                        <h1 className="font-headline text-3xl font-bold">{subject.name}</h1>
                        <p className="text-muted-foreground">{subject.teacher}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={cn("text-4xl font-bold", textColor)}>{subject.grade}</p>
                        <p className="text-xs text-muted-foreground">Based on submitted work</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{subject.progress}%</p>
                        <Progress value={subject.progress} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{subjectTasks.length}</p>
                        <p className="text-xs text-muted-foreground">Assignments and projects</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tasks">
                <TabsList className="mb-4">
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasks</CardTitle>
                            <CardDescription>All assignments and projects for {subject.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TaskList subjectTasks={subjectTasks} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="activities">
                     <Card>
                        <CardHeader>
                            <CardTitle>Activities</CardTitle>
                            <CardDescription>All quizzes and exams for {subject.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ActivityList subjectActivities={subjectActivities} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="resources">
                     <Card>
                        <CardHeader>
                            <CardTitle>Learning Resources</CardTitle>
                            <CardDescription>All learning materials for {subject.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ResourceList subjectResources={subjectResources} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    );
}
