import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { isRead } = await request.json()

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Verify the notification belongs to the user
    const existingNotification = await db.notification.findFirst({
      where: { id, userId }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    const notification = await db.notification.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? isRead : existingNotification.isRead
      }
    })

    return NextResponse.json({
      message: "Notification updated successfully",
      notification
    })

  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Verify the notification belongs to the user
    const existingNotification = await db.notification.findFirst({
      where: { id, userId }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    await db.notification.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Notification deleted successfully"
    })

  } catch (error) {
    console.error("Notification deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
