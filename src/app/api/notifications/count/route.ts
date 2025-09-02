import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const unreadCount = await db.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return NextResponse.json({
      count: unreadCount
    })

  } catch (error) {
    console.error("Notification count fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
