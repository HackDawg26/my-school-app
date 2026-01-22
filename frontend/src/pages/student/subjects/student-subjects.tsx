import React from "react";
import { Link } from "react-router-dom";

export const subjects = [
  { id: "SUB-01", name: "Filipino", teacher: "G. Reyes", progress: 75, grade: 89, color: "bg-red-400" },
  { id: "SUB-02", name: "English", teacher: "Ms. Smith", progress: 60, grade: 92, color: "bg-blue-400" },
  { id: "SUB-03", name: "Mathematics", teacher: "Mr. Garcia", progress: 85, grade: 91, color: "bg-yellow-400" },
  { id: "SUB-04", name: "Science", teacher: "Gng. Santos", progress: 70, grade: 90, color: "bg-green-400" },
  { id: "SUB-05", name: "Araling Panlipunan (AP)", teacher: "G. Mercado", progress: 45, grade: 94, color: "bg-amber-600" },
  { id: "SUB-06", name: "Edukasyon sa Pagpapakatao (ESP)", teacher: "G. Villanueva", progress: 90, grade: 98, color: "bg-purple-400" },
  { id: "SUB-07", name: "MAPEH", teacher: "Gng. Perez", progress: 80, grade: 96, color: "bg-orange-400" },
];

export default function SubjectsPage() {
  return (
    <main className="flex-1 p-1">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground text-sm">
          An overview of academic performance per learning area.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject) => {
          const isPassing = subject.grade >= 75;

          return (
            <Link to={`/student/subject/${subject.id}`} key={subject.id} className="group">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex h-full flex-col transition-all group-hover:shadow-xl group-hover:border-indigo-200 group-hover:-translate-y-1 overflow-hidden">
                {/* Subject Header */}
                <div className="flex flex-col space-y-1 p-4 pb-2">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors truncate">
                        {subject.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider truncate">
                        {subject.teacher}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={[
                        "text-[10px] font-black px-2 py-1 rounded-md uppercase whitespace-nowrap",
                        isPassing ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
                      ].join(" ")}
                    >
                      {isPassing ? "Passed" : "Below Criteria"}
                    </span>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="px-4 grow">
                  <div className="mb-3 flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-400">Term Completion</span>
                    <span className="text-slate-900">{subject.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={[
                        "h-full transition-all duration-1000 ease-out",
                        isPassing ? "bg-indigo-500" : "bg-red-500",
                      ].join(" ")}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    {subject.progress === 100 ? "All quarters encoded" : "Ongoing grading period"}
                  </p>
                </div>

                {/* Grade Footer */}
                <div className="flex items-center px-4 py-2 bg-slate-50/50 border-t border-slate-50">
                  <div className="flex w-full justify-between items-center">
                    <span className="text-[11px] font-black text-slate-500 uppercase">
                      Average Grade
                    </span>

                    <div className="flex flex-col items-end">
                      <span
                        className={[
                          "font-black text-3xl tracking-tighter",
                          isPassing ? "text-slate-900" : "text-red-600",
                        ].join(" ")}
                      >
                        {subject.grade}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 -mt-1 uppercase">
                        SF9 Official Entry
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
