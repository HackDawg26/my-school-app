
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import type { Resource } from "../lib/types";
import { FileText, Link as LinkIcon, Video, Download } from "lucide-react";
import { Button } from "./button";
import {Link} from "react-router-dom";

const ResourceIcon = ({ type }: { type: Resource['type'] }) => {
    switch (type) {
        case 'File': return <FileText className="h-6 w-6 text-primary" />;
        case 'Link': return <LinkIcon className="h-6 w-6 text-primary" />;
        case 'Video': return <Video className="h-6 w-6 text-primary" />;
        default: return <FileText className="h-6 w-6 text-primary" />;
    }
}

function ResourceItem({ resource }: { resource: Resource }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ResourceIcon type={resource.type} />
                </div>
                <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Link to={resource.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {resource.type === 'Link' || resource.type === 'Video' ? 'Open Link' : 'Download File'}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export function ResourceList({ subjectResources }: { subjectResources: Resource[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjectResources.map(resource => (
                <ResourceItem key={resource.id} resource={resource} />
            ))}
        </div>
    );
}
