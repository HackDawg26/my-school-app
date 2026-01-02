
'use client';

import { GradeReport } from "../../../components/components/grade-report";
import { student, subjectGrades } from "../../../components/lib/data";
import { SubjectPerformanceChart } from "../../../components/components/subject-performance-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/components/card";


export default function GradesPage() {
    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                         <GradeReport grades={subjectGrades} student={student} />
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Subject Performance</CardTitle>
                                <CardDescription>A visual summary of your grades per subject.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <SubjectPerformanceChart grades={subjectGrades} />
                               <p className="text-xs text-center text-muted-foreground pt-0 italic">
                                "Success is the sum of small efforts, repeated day in and day out."
                               </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
