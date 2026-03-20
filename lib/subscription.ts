/**
 * Хелперы для подписки: дни до конца, истекла ли, срочно ли.
 */

export type Plan = "FREE" | "PRO" | "PRO+";

const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  FREE: "For personal use and exploration of the platform.",
  PRO: "Perfect for traders and small teams in need of advanced analytics.",
  "PRO+": "Full access for power users who need all features and priority support.",
};

export const PLAN_PRICES: Record<Exclude<Plan, "FREE">, string> = {
  PRO: "$9.99",
  "PRO+": "$19.99",
};

export const PLAN_FEATURES: Record<Plan, string[]> = {
  FREE: ["Basic dashboard access", "Limited analytics", "Email support"],
  PRO: ["Unlimited analytics", "Full feature access", "Priority support"],
  "PRO+": ["Everything in PRO", "Advanced reporting", "Dedicated support"],
};

export function planDescription(plan: Plan | string): string {
  return PLAN_DESCRIPTIONS[plan as Plan] ?? plan;
}

/** Дней до окончания подписки. null = без ограничения (FREE или вечная). */
export function daysLeft(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  const now = new Date();
  if (end <= now) return 0;
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

/** Подписка истекла. */
export function isExpired(endsAt: string | null | undefined): boolean {
  if (!endsAt) return false; // FREE без срока
  return new Date(endsAt) <= new Date();
}

/** Меньше N дней до конца — срочно (красная точка на колокольчике). */
export function isUrgent(endsAt: string | null | undefined, thresholdDays = 5): boolean {
  const days = daysLeft(endsAt);
  if (days === null) return false; // без ограничения
  return days < thresholdDays;
}

/** Показывать красную точку: срочно или истекло. */
export function showBellBadge(endsAt: string | null | undefined, plan: Plan | string): boolean {
  if (plan === "FREE" && !endsAt) return false;
  return isExpired(endsAt) || isUrgent(endsAt, 5);
}
