export enum CancellationPolicyType {
  FLEXIBLE = "FLEXIBLE",
  MODERATE = "MODERATE",
  STRICT = "STRICT",
}

export interface CancellationPolicy {
  type: CancellationPolicyType
  hoursBeforeAppointment: number
  lateCancellationFeePercent: number
  description: string
}

export const CANCELLATION_POLICIES: Record<CancellationPolicyType, CancellationPolicy> = {
  [CancellationPolicyType.FLEXIBLE]: {
    type: CancellationPolicyType.FLEXIBLE,
    hoursBeforeAppointment: 2,
    lateCancellationFeePercent: 0,
    description: "ביטול חופשי עד שעתיים לפני התור",
  },
  [CancellationPolicyType.MODERATE]: {
    type: CancellationPolicyType.MODERATE,
    hoursBeforeAppointment: 24,
    lateCancellationFeePercent: 50,
    description: "ביטול חופשי עד 24 שעות לפני. ביטול באיחור - חיוב של 50%",
  },
  [CancellationPolicyType.STRICT]: {
    type: CancellationPolicyType.STRICT,
    hoursBeforeAppointment: 48,
    lateCancellationFeePercent: 100,
    description: "ביטול חופשי עד 48 שעות לפני. ביטול באיחור - חיוב מלא",
  },
}

export function canCancelAppointment(
  appointmentTime: Date,
  policy: CancellationPolicy
): { canCancel: boolean; fee: number; message: string } {
  const now = new Date()
  const hoursUntilAppointment =
    (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilAppointment >= policy.hoursBeforeAppointment) {
    return {
      canCancel: true,
      fee: 0,
      message: "ביטול ללא עלות",
    }
  }

  if (hoursUntilAppointment < 0) {
    return {
      canCancel: false,
      fee: 100,
      message: "לא ניתן לבטל תור שעבר",
    }
  }

  return {
    canCancel: true,
    fee: policy.lateCancellationFeePercent,
    message: `ביטול באיחור - יחויב ${policy.lateCancellationFeePercent}% מהמחיר`,
  }
}

export async function trackCancellation(userId: string) {
  // Track cancellation count for user (implement in DB)
  // For now, just a placeholder
  return true
}

export function shouldBlockUser(cancellationCount: number): boolean {
  // Block users who cancelled more than 3 times in a month
  return cancellationCount >= 3
}

