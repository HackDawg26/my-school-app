
import { useState} from 'react';

import {BarChart3 } from 'lucide-react';



export default function StudentQuarterlyGrades() {
  const [selectedSemester, setSelectedSemester] = useState<"SEM1" | 'SEM2' | 'SEM3'>('SEM1');

  const semesters = [
    {
      id: 'SEM1',
      label: 'Semester 1',
    },
    {
      id: 'SEM2',
      label: 'Semester 2',
    },
    {
      id: 'SEM3',
      label: 'Semester 3',
    },

  ] as const;


  return (
    <main className=" bg-slate-50">
      <div className="mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Grades</h1>
          <p className="mt-2 text-sm text-slate-500">View your grades for each semester.</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {semesters.map((semester) => (
            <button
              key={semester.id}
              type="button"
              onClick={() => setSelectedSemester(semester.id)}
              className={`rounded-[18px] border bg-white p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition ${
                selectedSemester === semester.id
                  ? 'border-[#7868f5] ring-2 ring-[#ebe8ff]'
                  : 'border-slate-200 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-950">
                    {semester.label}
                  </div>

                  <div className="mt-1 text-[11px] font-medium text-slate-500">
                    Grade report
                  </div>

                  <div className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                    —
                  </div>

                  <div className="mt-1 text-[11px] text-slate-500">
                    Average
                  </div>
                </div>

                <BarChart3 className="mb-2 size-10 text-slate-400" strokeWidth={2.4} />
              </div>
            </button>
          ))}
        </div>

        <section className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.055)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-sm font-extrabold text-slate-950">
              {
                semesters.find(
                  (semester) => semester.id === selectedSemester
                )?.label
              } Grades
            </h2>
          </div>
          
          <div className="grid min-h-[260px] place-items-center px-6 py-12 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <BarChart3 className="size-7" />
              </div>

              <h3 className="mt-4 font-extrabold text-slate-900">
                Grades are not available yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Semester grade data will appear here once the grading backend is connected.
              </p>
            </div>
          </div>




          {/* <div>
            
            {selectedReport && selectedReport.rows.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-[0.04em] text-slate-500">
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4 text-center">Final Grade</th>
                        <th className="px-6 py-4 text-center">Letter Grade</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.rows.map((row) => (
                        <tr key={row.subjectId} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{row.subjectName}</td>
                          <td className="px-6 py-4 text-center text-sm font-extrabold text-slate-950">{row.finalGrade}</td>
                          <td className="px-6 py-4 text-center text-sm font-extrabold text-slate-950">{row.letterGrade}</td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
                  <div className="text-lg font-extrabold text-slate-950">{selectedQuarter} GPA</div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950">{selectedReport.gpa?.toFixed(2)}</div>
                    <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-extrabold text-emerald-600">Passed</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid min-h-[260px] place-items-center px-6 py-12 text-center">
                <div>
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <BarChart3 className="size-7" />
                  </div>
                  <h3 className="mt-4 font-extrabold text-slate-900">Grades are not available yet</h3>
                  <p className="mt-2 text-sm text-slate-500">This semester is currently {statusStyles[selectedSemester.status].label.toLowerCase()}.</p>
                </div>
              </div>
            )}


          </div> */}
        </section>

        
        
        

      </div>
    </main>
  );
}
