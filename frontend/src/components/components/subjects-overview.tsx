
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Progress } from "./progress";
import { subjects } from "../lib/data";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { ArrowRight } from "lucide-react/dist/lucide-react";
import { cn, getSubjectColors } from "../lib/utils";

export function SubjectsOverview() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Subjects Overview</CardTitle>
        <CardDescription>A quick look at your current subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.slice(0, 3).map((subject) => {
            const { borderColor, textColor } = getSubjectColors(subject.color);
            return (
              <Link to={`/subjects/${subject.id}`} key={subject.id} className="group">
                <Card className={cn("flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1 border-t-4", borderColor)}>
                  <CardHeader className="pb-4">
                      <div>
                          <h3 className="font-semibold">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">{subject.teacher}</p>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} color={subject.color} />
                  </CardContent>
                  <div className="border-t p-4 pt-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Current Grade</span>
                        <span className={cn("font-bold text-lg", textColor)}>{subject.grade}</span>
                    </div>
                  </div>
                </Card>
            </Link>
          )})}
        </div>
        <div className="mt-6 flex justify-end">
            <Link to="/subjects">
                <Button variant="outline">
                    View All Subjects <ArrowRight className="ml-2" />
                </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
