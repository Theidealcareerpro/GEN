export type Tier = "free" | "supporter" | "business";

export const HOSTING_DAYS: Record<Tier, number> = {
  free: 21,
  supporter: 90,
  business: 365,
};

export function tierFromString(s?: string | null): Tier {
  if (s === "supporter" || s === "business") return s;
  return "free";
}

export function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

export function addMonths(base: Date, months: number) {
  const d = new Date(base.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Handle month-end rollover (e.g., Jan 31 + 1 month)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

// Business paid extension options (GBP)
export const BUSINESS_EXTEND_OPTIONS = [
  { months: 3, amount_gbp: 5_00 },  // £5.00
  { months: 6, amount_gbp: 10_00 }, // £10.00
];

export function isSupportedBusinessMonths(m: number) {
  return BUSINESS_EXTEND_OPTIONS.some((o) => o.months === m);
}
export function priceForBusinessMonthsGBP(m: number) {
  const o = BUSINESS_EXTEND_OPTIONS.find((x) => x.months === m);
  return o ? o.amount_gbp : null;
}
