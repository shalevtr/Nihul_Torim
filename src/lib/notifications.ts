import { prisma } from "@/lib/db"

export type NotificationType =
  | "APPOINTMENT_PENDING"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_BOOKED"

interface CreateNotificationParams {
  userId: string
  businessId?: string
  appointmentId?: string
  type: NotificationType
  title: string
  message: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        businessId: params.businessId,
        appointmentId: params.appointmentId,
        type: params.type,
        title: params.title,
        message: params.message,
      },
    })
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

export async function createAppointmentNotification(
  appointmentId: string,
  businessId: string,
  customerId: string | null,
  businessOwnerId: string,
  type: NotificationType
) {
  const notifications = []

  // Notification for business owner
  if (type === "APPOINTMENT_PENDING") {
    notifications.push(
      createNotification({
        userId: businessOwnerId,
        businessId,
        appointmentId,
        type: "APPOINTMENT_PENDING",
        title: "תור חדש ממתין לאישור",
        message: "יש לך תור חדש שממתין לאישור",
      })
    )
  } else if (type === "APPOINTMENT_CONFIRMED") {
    notifications.push(
      createNotification({
        userId: businessOwnerId,
        businessId,
        appointmentId,
        type: "APPOINTMENT_CONFIRMED",
        title: "תור אושר",
        message: "תור אושר בהצלחה",
      })
    )
  } else if (type === "APPOINTMENT_CANCELLED") {
    notifications.push(
      createNotification({
        userId: businessOwnerId,
        businessId,
        appointmentId,
        type: "APPOINTMENT_CANCELLED",
        title: "תור בוטל",
        message: "תור בוטל",
      })
    )
  } else if (type === "APPOINTMENT_BOOKED") {
    notifications.push(
      createNotification({
        userId: businessOwnerId,
        businessId,
        appointmentId,
        type: "APPOINTMENT_BOOKED",
        title: "תור חדש נקבע",
        message: "תור חדש נקבע",
      })
    )
  }

  // Notification for customer (if exists)
  if (customerId) {
    if (type === "APPOINTMENT_CONFIRMED") {
      notifications.push(
        createNotification({
          userId: customerId,
          businessId,
          appointmentId,
          type: "APPOINTMENT_CONFIRMED",
          title: "התור שלך אושר",
          message: "התור שלך אושר בהצלחה",
        })
      )
    } else if (type === "APPOINTMENT_CANCELLED") {
      notifications.push(
        createNotification({
          userId: customerId,
          businessId,
          appointmentId,
          type: "APPOINTMENT_CANCELLED",
          title: "התור בוטל",
          message: "התור שלך בוטל",
        })
      )
    }
  }

  await Promise.all(notifications)
}



