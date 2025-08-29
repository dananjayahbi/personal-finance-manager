import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, amount, currency, dueDate, frequency, categoryId, description, isRecurring, isPaid } = await request.json()

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Verify the bill belongs to the user
    const existingBill = await db.bill.findFirst({
      where: { id, userId }
    })

    if (!existingBill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      )
    }

    const bill = await db.bill.update({
      where: { id },
      data: {
        name: name || existingBill.name,
        amount: amount ? parseFloat(amount) : existingBill.amount,
        currency: currency || existingBill.currency,
        dueDate: dueDate ? new Date(dueDate) : existingBill.dueDate,
        frequency: frequency || existingBill.frequency,
        categoryId: categoryId !== undefined ? categoryId : existingBill.categoryId,
        description: description !== undefined ? description : existingBill.description,
        isRecurring: isRecurring !== undefined ? isRecurring : existingBill.isRecurring,
        isPaid: isPaid !== undefined ? isPaid : existingBill.isPaid
      }
    })

    return NextResponse.json({
      message: "Bill updated successfully",
      bill
    })

  } catch (error) {
    console.error("Bill update error:", error)
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

    // Verify the bill belongs to the user
    const existingBill = await db.bill.findFirst({
      where: { id, userId }
    })

    if (!existingBill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      )
    }

    await db.bill.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Bill deleted successfully"
    })

  } catch (error) {
    console.error("Bill deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
