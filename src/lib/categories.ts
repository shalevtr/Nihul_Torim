export const BUSINESS_CATEGORIES = [
  "מספרה",
  "ציפורניים",
  "עיצוב שיער",
  "קוסמטיקאית",
  "מכון יופי",
  "איפור",
  "הסרת שיער",
  "עיסוי",
  "טיפולי פנים",
  "אחר",
] as const

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number]

