export const plans = {
  BASIC: { name: "Basic", price: 0, assetLimit: 5 },
  PLUS: { name: "Plus", price: 5, assetLimit: 100 },
  PRO: { name: "Pro", price: 20, assetLimit: 500 },
} as const;

export type UserPlan = keyof typeof plans;
