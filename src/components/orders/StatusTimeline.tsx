import { Check, XCircle } from "lucide-react";

const STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "GIVEN_TO_RIDER", label: "Given to rider" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  ...Object.fromEntries(STEPS.map((s) => [s.key, s.label])),
  CANCELLED: "Cancelled",
};

/** Badge colours per order status, shared by the admin and customer views. */
export const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  GIVEN_TO_RIDER: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-stone-200 text-stone-600",
};

export default function StatusTimeline({
  status,
  cancelReason,
  cancelledAt,
}: {
  status: string;
  cancelReason?: string | null;
  cancelledAt?: Date | string | null;
}) {
  // A cancelled order has left the delivery pipeline, so show why instead of
  // a stepper that would suggest it's merely stalled.
  if (status === "CANCELLED") {
    return (
      <div className="flex gap-3 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" />
        <div className="min-w-0 text-sm">
          <p className="font-bold text-stone-700">This order was cancelled</p>
          {cancelledAt && (
            <p className="text-xs text-stone-400">
              {new Date(cancelledAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
          {cancelReason && (
            <p className="mt-2 whitespace-pre-line wrap-break-word text-stone-600">
              <span className="font-semibold text-stone-700">Message from the shop: </span>
              {cancelReason}
            </p>
          )}
        </div>
      </div>
    );
  }

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
                  done ? "bg-santa-600 text-white" : "bg-stone-200 text-stone-400"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${done ? "text-santa-700" : "text-stone-400"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < activeIndex ? "bg-santa-600" : "bg-stone-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}
