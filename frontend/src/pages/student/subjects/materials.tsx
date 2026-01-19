
import { Card, CardContent } from "../../../components/components/card";
import { resources, subjects } from "../../../components/lib/data";
import {Link} from "react-router-dom";
import { Folder } from "lucide-react";
import type { Resource } from "../../../components/lib/types";
import { cn, getSubjectColors } from "../../../components/lib/utils";

export default function MaterialsPage() {

    const resourcesBySubject = resources.reduce((acc, resource) => {
        const subjectId = resource.subjectId;
        if (!acc[subjectId]) {
            acc[subjectId] = [];
        }
        acc[subjectId].push(resource);
        return acc;
    }, {} as Record<string, Resource[]>);

    const subjectsWithResources = subjects.filter(subject => resourcesBySubject[subject.id]?.length > 0);

    return (
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Materials</h1>
                <p className="text-muted-foreground">Find all your learning resources, organized by subject.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {subjectsWithResources.map((subject) => {
                     const { textColor } = getSubjectColors(subject.color);
                     const resourceCount = resourcesBySubject[subject.id].length;
                    return (
                    <Link to={`/materials/${subject.id}`} key={subject.id} className="group flex">
                        <Card className="w-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                           <CardContent className="p-4 flex items-center gap-4 h-full">
                             <Folder className={cn("h-10 w-10 shrink-0", textColor)} />
                             <div>
                               <h3 className="font-semibold text-base">{subject.name}</h3>
                               <p className="text-sm text-muted-foreground">
                                 {resourceCount} resource{resourceCount > 1 ? 's' : ''}
                               </p>
                             </div>
                           </CardContent>
                        </Card>
                    </Link>
                )})}
            </div>
        </main>
    );
}
