import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  Icon: LucideIcon;
}

const StatCard = ({
  label,
  value,
  hint,
  Icon,
}: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            {label}
          </p>

          <div className="text-3xl font-black text-slate-900">
            {value}
          </div>

          {hint && (
            <div className="mt-2 text-xs text-slate-500">
              {hint}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-2.5 text-slate-500">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;