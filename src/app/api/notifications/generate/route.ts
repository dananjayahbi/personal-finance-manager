import { NextRequest, NextResponse } from "next/server"
import { generateDueDateNotifications, cleanupOldNotifications } from "@/lib/notification-generator"

export async function POST(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Generate new notifications
    const result = await generateDueDateNotifications(userId)

    // Clean up old notifications
    const cleanedUp = await cleanupOldNotifications(userId)

    return NextResponse.json({
      message: "Notifications generated successfully",
      result: {
        ...result,
        cleanedUpCount: cleanedUp
      }
    })

  } catch (error) {
    console.error("Notification generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
