import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get("isRead")
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = { userId }
    
    if (isRead !== null) {
      where.isRead = isRead === "true"
    }
    
    if (type) {
      where.type = type
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit
    })

    return NextResponse.json({
      notifications
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
    const { title, message, type, actionUrl } = await request.json()

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
        actionUrl: actionUrl || null,
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
