import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  id: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const requestData = await request.json()

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const scheduledTransaction = await db.scheduledTransaction.findFirst({
      where: { id, userId }
    })

    if (!scheduledTransaction) {
      return NextResponse.json(
        { error: "Scheduled transaction not found" },
        { status: 404 }
      )
    }

    // Check if this is an execution action
    if (requestData.action) {
      if (requestData.action === "execute") {
        // Mark as executed and set execution date
        const updatedTransaction = await db.scheduledTransaction.update({
          where: { id },
          data: {
            isExecuted: true,
            executedDate: new Date()
          }
        })

        return NextResponse.json({
          message: "Transaction executed successfully",
          scheduledTransaction: updatedTransaction
        })
      } else if (requestData.action === "undo") {
        // Mark as not executed and clear execution date
        const updatedTransaction = await db.scheduledTransaction.update({
          where: { id },
          data: {
            isExecuted: false,
            executedDate: null
          }
        })

        return NextResponse.json({
          message: "Transaction execution undone successfully",
          scheduledTransaction: updatedTransaction
        })
      } else {
        return NextResponse.json(
          { error: "Invalid action. Use 'execute' or 'undo'" },
          { status: 400 }
        )
      }
    } else {
      // This is a regular update
      const { description, amount, currency, fromAccountId, toAccountId, scheduledDate, frequency } = requestData

      const updateData: any = {}
      if (description !== undefined) updateData.description = description
      if (amount !== undefined) updateData.amount = parseFloat(amount)
      if (currency !== undefined) updateData.currency = currency
      if (fromAccountId !== undefined) updateData.fromAccountId = fromAccountId
      if (toAccountId !== undefined) updateData.toAccountId = toAccountId
      if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate)
      if (frequency !== undefined) updateData.frequency = frequency

      const updatedTransaction = await db.scheduledTransaction.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({
        message: "Scheduled transaction updated successfully",
        scheduledTransaction: updatedTransaction
      })
    }

  } catch (error) {
    console.error("Scheduled transaction update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const scheduledTransaction = await db.scheduledTransaction.findFirst({
      where: { id, userId }
    })

    if (!scheduledTransaction) {
      return NextResponse.json(
        { error: "Scheduled transaction not found" },
        { status: 404 }
      )
    }

    await db.scheduledTransaction.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Scheduled transaction deleted successfully"
    })

  } catch (error) {
    console.error("Scheduled transaction deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
