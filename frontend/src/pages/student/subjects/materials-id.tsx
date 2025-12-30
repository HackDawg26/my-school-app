
'use client';

import { useParams, notFound } from "next/navigation";
import { subjects, resources as allResources } from "@/lib/data";
import { ResourceList } from "@/components/subjects/resource-list";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SubjectMaterialsPage() {
    const params = useParams();
    const subject = subjects.find(s => s.id === params.id);

    if (!subject) {
        notFound();
    }

    const subjectResources = allResources.filter(r => r.subjectId === subject.id);

    return (
        <main className="p-4 md:p-6">
             <div className="flex items-center gap-4 mb-6">
                <Link href="/materials">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-full", subject.color)} />
                    <div>
                        <h1 className="font-headline text-3xl font-bold">{subject.name} Materials</h1>
                        <p className="text-muted-foreground">All learning resources for {subject.name}.</p>
                    </div>
                </div>
            </div>
            <div>
               <ResourceList subjectResources={subjectResources} />
            </div>
        </main>
    );
}
