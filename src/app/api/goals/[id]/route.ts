import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, targetAmount, currentAmount, currency, deadline } = await request.json()

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Verify the goal belongs to the user
    const existingGoal = await db.goal.findFirst({
      where: { id, userId }
    })

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      )
    }

    const goal = await db.goal.update({
      where: { id },
      data: {
        name: name || existingGoal.name,
        targetAmount: targetAmount ? parseFloat(targetAmount) : existingGoal.targetAmount,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : existingGoal.currentAmount,
        currency: currency || existingGoal.currency,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existingGoal.deadline
      }
    })

    return NextResponse.json({
      message: "Goal updated successfully",
      goal
    })

  } catch (error) {
    console.error("Goal update error:", error)
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

    // Verify the goal belongs to the user
    const existingGoal = await db.goal.findFirst({
      where: { id, userId }
    })

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      )
    }

    await db.goal.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Goal deleted successfully"
    })

  } catch (error) {
    console.error("Goal deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
