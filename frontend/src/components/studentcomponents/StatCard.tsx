

interface StatCardProps {
  label: string;
  value: number;

}

const StatCard = ({
  label,
  value
}: StatCardProps) => {
  const safeValue = value ?? 0;
  const ringDegrees = Math.max(0, Math.min(360, safeValue * 3.6))
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="text-lg font-extrabold tracking-[-0.025em] text-slate-950">{label}</h2>
      <div className="mt-8 grid place-items-center">
        <div
          className="grid size-[200px] place-items-center rounded-full p-[10px]"
          style={{
            background: `conic-gradient(#5b4cf6 0deg ${ringDegrees * 0.72}deg, #7f6ff6 ${ringDegrees * 0.72}deg ${ringDegrees}deg, #ddd9ff ${ringDegrees}deg 360deg)`,
          }}
        >
          <div className="grid size-full place-items-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <div className="text-[42px] font-extrabold tracking-[-0.04em] text-slate-950">
                {value !== null ? value.toFixed(1) : "-"} {/** semester grade */}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">Out of 100</div>
              
              {value !== null && (
                <div className={`mt-4 text-base font-bold${
                  value >= 75 
                    ? "text-emerald-600"
                    : "text-red--600"
                }`}
                >
                  {value >= 75
                    ? "Passing"
                    : "Needs Improvement"
                  }

                </div>
              )

              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatCard;