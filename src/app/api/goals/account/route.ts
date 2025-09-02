import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Get user settings including goals account
    const userSettings = await db.userSettings.findUnique({
      where: { userId },
      include: {
        goalsAccount: true,
      },
    })

    if (!userSettings || !userSettings.goalsAccount) {
      return NextResponse.json({
        hasGoalsAccount: false,
        goalsAccount: null,
        message: "No goals account configured"
      })
    }

    return NextResponse.json({
      hasGoalsAccount: true,
      goalsAccount: userSettings.goalsAccount,
    })

  } catch (error) {
    console.error("Goals account fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
