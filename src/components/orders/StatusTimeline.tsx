import { Check } from "lucide-react";

const STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "GIVEN_TO_RIDER", label: "Given to rider" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

export default function StatusTimeline({ status }: { status: string }) {
  const activeIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-fuchsia-600 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${done ? "text-fuchsia-700" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < activeIndex ? "bg-fuchsia-600" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function statusLabel(status: string) {
  return STEPS.find((s) => s.key === status)?.label ?? status;
}
