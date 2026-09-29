export const DELIVERY_CHARGE = {
  INSIDE_DHAKA: 80,
  OUTSIDE_DHAKA: 150,
} as const;

export type Zone = keyof typeof DELIVERY_CHARGE;

export const ZONE_LABELS: Record<Zone, string> = {
  INSIDE_DHAKA: "Inside Dhaka",
  OUTSIDE_DHAKA: "Outside Dhaka",
};
