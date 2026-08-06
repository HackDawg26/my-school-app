import { CalendarDays, ChevronDown } from 'lucide-react';
import type { Semester } from '../student_types/portal';

interface SemesterPickerProps {
  semesters: Semester[];
  value: string;
  onChange: (semesterId: string) => void;
  showAcademicYear?: boolean;
}

export function SemesterPicker({
  semesters,
  value,
  onChange,
  showAcademicYear = false,
}: SemesterPickerProps) {
  const selectedSemester = semesters.find((semester) => semester.id === value) ?? semesters[0];

  return (
    <div className="text-right">
      <label className="relative inline-flex min-w-[152px] items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
        <CalendarDays className="size-4 text-slate-500" />
        <select
          aria-label="Select semester"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer appearance-none opacity-0"
        >
          {semesters.map((semester) => (
            <option key={semester.id} value={semester.id}>
              {semester.label}
            </option>
          ))}
        </select>
        <span className="ml-3 flex-1 text-left text-sm font-semibold text-slate-700">{selectedSemester?.label}</span>
        <ChevronDown className="size-4 text-slate-500" />
      </label>
      {showAcademicYear && selectedSemester && (
        <div className="mt-2 pr-2 text-xs font-medium text-slate-500">A.Y. {selectedSemester.academicYear}</div>
      )}
    </div>
  );
}
