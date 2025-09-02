import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const { description, amount, type, categoryId, date, recurring, frequency, currency, fromAccountId, toAccountId } = await request.json()

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { error: "Description, amount, type, and date are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session and verify ownership
    const userId = request.headers.get("x-user-id") || "user-1"

    const existingTransaction = await db.transaction.findFirst({
      where: { id, userId }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await db.$transaction(async (tx) => {
      // First, reverse the effects of the old transaction on account balances
      if (existingTransaction.fromAccountId) {
        await tx.account.update({
          where: { id: existingTransaction.fromAccountId },
          data: {
            balance: {
              increment: existingTransaction.amount // Reverse: add back the money that was taken out
            }
          }
        })
      }

      if (existingTransaction.toAccountId) {
        await tx.account.update({
          where: { id: existingTransaction.toAccountId },
          data: {
            balance: {
              decrement: existingTransaction.amount // Reverse: subtract the money that was added
            }
          }
        })
      }

      // Now update the transaction with new data
      const transaction = await tx.transaction.update({
        where: { id },
        data: {
          description,
          amount: parseFloat(amount),
          type,
          categoryId: categoryId || null,
          date: new Date(date),
          recurring: recurring || false,
          frequency: recurring ? frequency : null,
          currency: currency || "LKR",
          fromAccountId: fromAccountId || null,
          toAccountId: toAccountId || null
        },
        include: {
          category: true
        }
      })

      // Apply the effects of the new transaction on account balances
      if (fromAccountId) {
        await tx.account.update({
          where: { id: fromAccountId },
          data: {
            balance: {
              decrement: parseFloat(amount) // Money going out of fromAccount
            }
          }
        })
      }

      if (toAccountId) {
        await tx.account.update({
          where: { id: toAccountId },
          data: {
            balance: {
              increment: parseFloat(amount) // Money going into toAccount
            }
          }
        })
      }

      return transaction
    })

    return NextResponse.json({
      message: "Transaction updated successfully",
      transaction: result
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
    const { id } = await params

    // In a real app, you would get the user ID from the session and verify ownership
    const userId = request.headers.get("x-user-id") || "user-1"

    const existingTransaction = await db.transaction.findFirst({
      where: { id, userId }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Use a transaction to ensure all operations succeed or fail together
    await db.$transaction(async (tx) => {
      // First, reverse the effects of the transaction on account balances
      if (existingTransaction.fromAccountId) {
        await tx.account.update({
          where: { id: existingTransaction.fromAccountId },
          data: {
            balance: {
              increment: existingTransaction.amount // Reverse: add back the money that was taken out
            }
          }
        })
      }

      if (existingTransaction.toAccountId) {
        await tx.account.update({
          where: { id: existingTransaction.toAccountId },
          data: {
            balance: {
              decrement: existingTransaction.amount // Reverse: subtract the money that was added
            }
          }
        })
      }

      // Then delete the transaction
      await tx.transaction.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      message: "Transaction deleted successfully"
    })

  } catch (error: any) {
    console.error("Transaction deletion error:", error)
    
    // Handle Prisma P2025 error (record not found)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Transaction not found or already deleted" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}