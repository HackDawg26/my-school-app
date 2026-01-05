import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { GraduationCap } from "lucide-react/dist/lucide-react";

type GpaCardProps = {
    gpa: number;
};

export function GpaCard({ gpa }: GpaCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Average</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold font-headline text-primary">{gpa.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Based on submitted work</p>
            </CardContent>
        </Card>
    );
}
