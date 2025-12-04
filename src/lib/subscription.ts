export type SubscriptionPlan = "BASIC" | "STANDARD" | "PREMIUM"

export const SUBSCRIPTION_FEATURES = {
  BASIC: {
    name: "בסיסי",
    price: 49,
    features: [
      "עד 50 תורים בחודש",
      "גלריה בסיסית",
      "ביקורות",
      "מחירון",
    ],
    maxMonthlyAppointments: 50,
    canUseAdvancedGallery: false,
    canUseStats: false,
    canManageStaff: false,
    canExportData: false,
  },
  STANDARD: {
    name: "סטנדרט",
    price: 99,
    features: [
      "תורים ללא הגבלה",
      "גלריה מתקדמת (לפני/אחרי)",
      "ניהול צוות",
      "ייצוא נתונים",
    ],
    maxMonthlyAppointments: -1, // unlimited
    canUseAdvancedGallery: true,
    canUseStats: false,
    canManageStaff: true,
    canExportData: true,
  },
  PREMIUM: {
    name: "פרימיום",
    price: 199,
    features: [
      "כל תכונות סטנדרט",
      "סטטיסטיקות ודוחות",
      "תקנון ביטולים מתקדם",
      "תמיכה עדיפות",
    ],
    maxMonthlyAppointments: -1,
    canUseAdvancedGallery: true,
    canUseStats: true,
    canManageStaff: true,
    canExportData: true,
  },
}

export function canAccessFeature(plan: SubscriptionPlan, feature: string): boolean {
  const planFeatures = SUBSCRIPTION_FEATURES[plan]
  
  switch (feature) {
    case "stats":
      return planFeatures.canUseStats
    case "staff":
      return planFeatures.canManageStaff
    case "advanced_gallery":
      return planFeatures.canUseAdvancedGallery
    default:
      return true
  }
}

export function getPlanName(plan: SubscriptionPlan): string {
  return SUBSCRIPTION_FEATURES[plan].name
}

export function getPlanPrice(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_FEATURES[plan].price
}

