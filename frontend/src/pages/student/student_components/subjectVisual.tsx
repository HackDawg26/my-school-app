import { BookOpen, Braces, Calculator, Database } from 'lucide-react';
import type { SubjectAccent, SubjectIconName } from '../student_types/portal';

interface SubjectVisualProps {
  accent: SubjectAccent;
//   icon: SubjectIconName;
  size?: 'sm' | 'md';
}

const accentClasses: Record<SubjectAccent, string> = {
  violet: 'bg-[#eeeaff] text-[#6554f5]',
  green: 'bg-[#e0f7ed] text-[#0aa66d]',
  amber: 'bg-[#fff1d3] text-[#f3a300]',
  blue: 'bg-[#e4f0ff] text-[#287ef3]',
};

const icons = {
  code: Braces,
  database: Database,
  calculator: Calculator,
  book: BookOpen,
};

export function SubjectVisual({ accent, size = 'md' }: SubjectVisualProps) {
  
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-xl ${accentClasses[accent]} ${
        size === 'sm' ? 'size-10' : 'size-12'
      }`}
    >
      {/* <Icon className={size === 'sm' ? 'size-5' : 'size-6'} strokeWidth={2} /> */}
    </div>
  );
}
