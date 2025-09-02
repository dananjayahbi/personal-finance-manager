import { db } from "./db"
import { NotificationType, NotificationPriority } from "@prisma/client"

const CLOSE_TO_DUE_DAYS = 3 // Days before due date to trigger close-to-due notification

export interface NotificationGenerationResult {
  billNotifications: number
  scheduledTransactionNotifications: number
  totalGenerated: number
}

/**
 * Generate notifications for close-to-due and overdue bills
 */
export async function generateBillNotifications(userId: string): Promise<number> {
  try {
    const now = new Date()
    const closeToThreshold = new Date()
    closeToThreshold.setDate(now.getDate() + CLOSE_TO_DUE_DAYS)

    // Find bills that are close to due or overdue and not paid
    const bills = await db.bill.findMany({
      where: {
        userId,
        isPaid: false,
        dueDate: {
          lte: closeToThreshold // Due date is within threshold or passed
        }
      },
      include: {
        notifications: {
          where: {
            type: NotificationType.BILL_DUE,
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Created within last 24 hours
            }
          }
        }
      }
    })

    let notificationsCreated = 0

    for (const bill of bills) {
      const isOverdue = bill.dueDate < now
      const isCloseToDue = bill.dueDate <= closeToThreshold && bill.dueDate >= now

      // Skip if we already have a recent notification for this bill
      if (bill.notifications.length > 0) {
        continue
      }

      let title: string
      let message: string
      let priority: NotificationPriority

      if (isOverdue) {
        const overdueDays = Math.floor((now.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        title = `Overdue Bill: ${bill.name}`
        message = `Your bill "${bill.name}" was due ${overdueDays} day${overdueDays > 1 ? 's' : ''} ago. Amount: ${bill.currency} ${bill.amount.toFixed(2)}`
        priority = NotificationPriority.HIGH
      } else if (isCloseToDue) {
        const daysUntilDue = Math.ceil((bill.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        title = `Bill Due Soon: ${bill.name}`
        message = `Your bill "${bill.name}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. Amount: ${bill.currency} ${bill.amount.toFixed(2)}`
        priority = NotificationPriority.MEDIUM
      } else {
        continue // Skip if not overdue or close to due
      }

      await db.notification.create({
        data: {
          title,
          message,
          type: NotificationType.BILL_DUE,
          priority,
          billId: bill.id,
          userId,
          actionUrl: `/bills?highlight=${bill.id}`
        }
      })

      notificationsCreated++
    }

    return notificationsCreated
  } catch (error) {
    console.error('Error generating bill notifications:', error)
    return 0
  }
}

/**
 * Generate notifications for close-to-due and overdue scheduled transactions
 */
export async function generateScheduledTransactionNotifications(userId: string): Promise<number> {
  try {
    const now = new Date()
    const closeToThreshold = new Date()
    closeToThreshold.setDate(now.getDate() + CLOSE_TO_DUE_DAYS)

    // Find scheduled transactions that are close to due or overdue and not executed
    const scheduledTransactions = await db.scheduledTransaction.findMany({
      where: {
        userId,
        isExecuted: false,
        scheduledDate: {
          lte: closeToThreshold // Scheduled date is within threshold or passed
        }
      },
      include: {
        notifications: {
          where: {
            type: NotificationType.SCHEDULED_TRANSACTION,
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Created within last 24 hours
            }
          }
        }
      }
    })

    let notificationsCreated = 0

    for (const transaction of scheduledTransactions) {
      const isOverdue = transaction.scheduledDate < now
      const isCloseToDue = transaction.scheduledDate <= closeToThreshold && transaction.scheduledDate >= now

      // Skip if we already have a recent notification for this transaction
      if (transaction.notifications.length > 0) {
        continue
      }

      let title: string
      let message: string
      let priority: NotificationPriority

      if (isOverdue) {
        const overdueDays = Math.floor((now.getTime() - transaction.scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
        title = `Overdue Transaction: ${transaction.description}`
        message = `Your scheduled transaction "${transaction.description}" was due ${overdueDays} day${overdueDays > 1 ? 's' : ''} ago. Amount: ${transaction.currency} ${transaction.amount.toFixed(2)}`
        priority = NotificationPriority.HIGH
      } else if (isCloseToDue) {
        const daysUntilDue = Math.ceil((transaction.scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        title = `Transaction Due Soon: ${transaction.description}`
        message = `Your scheduled transaction "${transaction.description}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. Amount: ${transaction.currency} ${transaction.amount.toFixed(2)}`
        priority = NotificationPriority.MEDIUM
      } else {
        continue // Skip if not overdue or close to due
      }

      await db.notification.create({
        data: {
          title,
          message,
          type: NotificationType.SCHEDULED_TRANSACTION,
          priority,
          scheduledTransactionId: transaction.id,
          userId,
          actionUrl: `/transactions?highlight=${transaction.id}`
        }
      })

      notificationsCreated++
    }

    return notificationsCreated
  } catch (error) {
    console.error('Error generating scheduled transaction notifications:', error)
    return 0
  }
}

/**
 * Generate all due date notifications for a user
 */
export async function generateDueDateNotifications(userId: string): Promise<NotificationGenerationResult> {
  const billNotifications = await generateBillNotifications(userId)
  const scheduledTransactionNotifications = await generateScheduledTransactionNotifications(userId)

  return {
    billNotifications,
    scheduledTransactionNotifications,
    totalGenerated: billNotifications + scheduledTransactionNotifications
  }
}

/**
 * Clean up old notifications (older than 30 days)
 */
export async function cleanupOldNotifications(userId: string): Promise<number> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await db.notification.deleteMany({
      where: {
        userId,
        isRead: true,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    return result.count
  } catch (error) {
    console.error('Error cleaning up old notifications:', error)
    return 0
  }
}
