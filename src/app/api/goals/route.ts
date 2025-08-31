import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, targetAmount, currentAmount, deadline, currency, accountId } = await request.json()

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: "Name and target amount are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    // For now, we'll use a placeholder or get it from the request
    const userId = request.headers.get("x-user-id") || "user-1"

    // If no accountId is provided, get the default goals account from settings
    let goalAccountId = accountId
    if (!goalAccountId) {
      const userSettings = await db.userSettings.findUnique({
        where: { userId },
      })
      goalAccountId = userSettings?.goalsAccountId || null
    }

    const goal = await db.goal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        currency: currency || "LKR",
        accountId: goalAccountId,
        userId
      }
    })

    return NextResponse.json({
      message: "Goal created successfully",
      goal
    })

  } catch (error) {
    console.error("Goal creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const goals = await db.goal.findMany({
      where: { userId },
      include: {
        account: true, // Include account information
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      goals
    })

  } catch (error) {
    console.error("Goals fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}