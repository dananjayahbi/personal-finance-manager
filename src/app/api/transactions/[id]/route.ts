import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { description, amount, type, categoryId, date, recurring, frequency, currency } = await request.json()
    const { id } = params

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { error: "Description, amount, type, and date are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session and verify ownership
    const userId = request.headers.get("x-user-id") || "default-user-id"

    const existingTransaction = await db.transaction.findFirst({
      where: { id, userId }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(amount),
        type,
        categoryId: categoryId || null,
        date: new Date(date),
        recurring: recurring || false,
        frequency: recurring ? frequency : null,
        currency: currency || "USD"
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      message: "Transaction updated successfully",
      transaction
    })

  } catch (error) {
    console.error("Transaction update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // In a real app, you would get the user ID from the session and verify ownership
    const userId = request.headers.get("x-user-id") || "default-user-id"

    const existingTransaction = await db.transaction.findFirst({
      where: { id, userId }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    await db.transaction.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Transaction deleted successfully"
    })

  } catch (error) {
    console.error("Transaction deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}