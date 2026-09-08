// All reporting dates are handled in Bangladesh time. Bangladesh has no DST,
// so a fixed +06:00 offset is exact year-round - no timezone library needed.
const BD_OFFSET = "+06:00";
export const BD_TIME_ZONE = "Asia/Dhaka";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

/** Start of the given `YYYY-MM-DD` in Bangladesh time. */
export function bdDayStart(isoDate: string) {
  return new Date(`${isoDate}T00:00:00.000${BD_OFFSET}`);
}

/** End of the given `YYYY-MM-DD` in Bangladesh time. */
export function bdDayEnd(isoDate: string) {
  return new Date(`${isoDate}T23:59:59.999${BD_OFFSET}`);
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
  label: string;
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Today's calendar date in Bangladesh as `YYYY-MM-DD`, for date inputs. */
export function bdTodayIso(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatBdDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: BD_TIME_ZONE,
  });
}

/**
 * Resolves the reporting window from URL params. `month` wins over `from`/`to`;
 * anything missing or malformed falls back to an open-ended (all time) range.
 */
export function resolveDateRange(params: { month?: string; from?: string; to?: string }): DateRange {
  const { month, from, to } = params;

  if (month && ISO_MONTH.test(month)) {
    const [y, m] = month.split("-").map(Number);
    // Day 0 of the next month is the last day of this one.
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return {
      start: bdDayStart(`${month}-01`),
      end: bdDayEnd(`${month}-${String(lastDay).padStart(2, "0")}`),
      label: monthLabel(month),
    };
  }

  const validFrom = from && ISO_DATE.test(from) ? bdDayStart(from) : null;
  const validTo = to && ISO_DATE.test(to) ? bdDayEnd(to) : null;

  if (validFrom && validTo) {
    return { start: validFrom, end: validTo, label: `${formatBdDate(validFrom)} — ${formatBdDate(validTo)}` };
  }
  if (validFrom) return { start: validFrom, end: null, label: `From ${formatBdDate(validFrom)}` };
  if (validTo) return { start: null, end: validTo, label: `Up to ${formatBdDate(validTo)}` };

  return { start: null, end: null, label: "All time" };
}

/** Prisma `gte`/`lte` filter for the range, or undefined when unbounded. */
export function toPrismaDateFilter(range: DateRange) {
  if (!range.start && !range.end) return undefined;
  return {
    ...(range.start ? { gte: range.start } : {}),
    ...(range.end ? { lte: range.end } : {}),
  };
}

/** Recent months (newest first) for the month picker, as `YYYY-MM` + label. */
export function recentMonths(count = 12, now = new Date()) {
  const months: { value: string; label: string }[] = [];
  // Anchor to the Bangladesh calendar date so a late-night UTC run doesn't skip a month.
  const bdToday = new Date(now.toLocaleString("en-US", { timeZone: BD_TIME_ZONE }));
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(bdToday.getFullYear(), bdToday.getMonth() - i, 1));
    const value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    months.push({ value, label: monthLabel(value) });
  }
  return months;
}
