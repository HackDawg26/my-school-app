// /*
//     this page shows all the subjects of the students on the current semester.
// */

// import { ArrowRight } from "lucide-react";

// export function SubjectListPage() {
//     return (
//        <div>
//             <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
//                 <div>
//                 <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-slate-950">My Subjects</h1>
//                 <p className="mt-2 text-sm text-slate-500">Here are the subjects you are currently enrolled in.</p>
//                 </div>
//                 <SemesterPicker semesters={data.semesters} value={selectedSemesterId} onChange={onSemesterChange} />
//             </header>

//             <div className="mt-8 grid gap-5 md:grid-cols-2">
//                 {data.subjects.map((subject) => (
//                 <article
//                     key={subject.id}
//                     className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
//                 >
//                     <div className="flex items-start gap-4">
//                     <SubjectVisual accent={subject.accent} icon={subject.icon} />
//                     <div className="min-w-0 flex-1">
//                         <h2 className="truncate text-lg font-extrabold tracking-[-0.025em] text-slate-950">{subject.name}</h2>
//                         <p className="mt-1 text-sm text-slate-500">{subject.instructor}</p>
//                     </div>
//                     </div>
//                     <div className="mt-7 space-y-2 text-sm font-medium text-slate-500">
//                     <p>{subject.days}</p>
//                     <p>{subject.time}</p>
//                     <div className="flex items-center justify-between gap-4">
//                         <p>{subject.room}</p>
//                         <button type="button" aria-label={`Open ${subject.name}`} className="rounded-full p-2 text-slate-500 hover:bg-slate-50 hover:text-[#5b4cf6]">
//                         <ArrowRight className="size-5" />
//                         </button>
//                     </div>
//                     </div>
//                 </article>
//                 ))}
//             </div>
//         </div>
        
//     );
// }