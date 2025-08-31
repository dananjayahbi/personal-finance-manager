import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get("isRead")
    const type = searchParams.get("type")
    const priority = searchParams.get("priority")
    const category = searchParams.get("category") // "bills", "transactions", or "all"
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = { userId }
    
    if (isRead !== null) {
      where.isRead = isRead === "true"
    }
    
    if (type) {
      where.type = type
    }

    if (priority) {
      where.priority = priority
    }

    // Filter by category
    if (category === "bills") {
      where.type = "BILL_DUE"
    } else if (category === "transactions") {
      where.type = "SCHEDULED_TRANSACTION"
    }

    const notifications = await db.notification.findMany({
      where,
      include: {
        bill: {
          select: {
            id: true,
            name: true,
            amount: true,
            currency: true,
            dueDate: true,
            isPaid: true
          }
        },
        scheduledTransaction: {
          select: {
            id: true,
            description: true,
            amount: true,
            currency: true,
            scheduledDate: true,
            isExecuted: true,
            type: true
          }
        }
      },
      orderBy: [
        { priority: "desc" }, // High priority first
        { createdAt: "desc" }
      ],
      take: limit
    })

    // Add computed fields for frontend
    const enhancedNotifications = notifications.map(notification => ({
      ...notification,
      isOverdue: notification.bill
        ? notification.bill.dueDate < new Date() && !notification.bill.isPaid
        : notification.scheduledTransaction
        ? notification.scheduledTransaction.scheduledDate < new Date() && !notification.scheduledTransaction.isExecuted
        : false,
      relatedItem: notification.bill || notification.scheduledTransaction || null
    }))

    return NextResponse.json({
      notifications: enhancedNotifications
    })

  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, priority, actionUrl, billId, scheduledTransactionId } = await request.json()

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Title, message, and type are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type,
        priority: priority || "MEDIUM",
        actionUrl: actionUrl || null,
        billId: billId || null,
        scheduledTransactionId: scheduledTransactionId || null,
        userId
      }
    })

    return NextResponse.json({
      message: "Notification created successfully",
      notification
    })

  } catch (error) {
    console.error("Notification creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
