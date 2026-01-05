
import { Card, CardContent, CardFooter, CardHeader } from "../../../components/components/card";
import { Progress } from "../../../components/components/progress";
import { subjects } from "../../../components/lib/data";
import {Link} from "react-router-dom";
import { cn, getSubjectColors } from "../../../components/lib/utils";

export default function SubjectsPage() {
    return (
        <main className="flex-1 p-1">
            <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Subjects</h1>
                <p className="text-muted-foreground">An overview of all your enrolled subjects.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subjects.map((subject) => {
                    const { borderColor, textColor } = getSubjectColors(subject.color);
                    return (
                        <Link to={`/student/subject/${subject.id}`} key={subject.id} className="group">
                            <Card className={cn("flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1 border-t-4", borderColor)}>
                                <CardHeader className="pb-4">
                                    <div>
                                        <h3 className="font-headline font-semibold text-xl">{subject.name}</h3>
                                        <p className="text-sm text-muted-foreground">{subject.teacher}</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="grow">
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{subject.progress}%</span>
                                    </div>

                                    <Progress value={subject.progress} color={subject.color} />
                                </CardContent>
                                <CardFooter>
                                    <div className="flex w-full justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Current Grade</span>
                                        <span className={cn("font-bold text-2xl", textColor)}>{subject.grade}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </main>
    );
}
