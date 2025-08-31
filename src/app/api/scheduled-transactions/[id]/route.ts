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
        // Use a transaction to ensure both operations succeed or fail together
        const result = await db.$transaction(async (tx) => {
          // Mark as executed and set execution date
          const updatedTransaction = await tx.scheduledTransaction.update({
            where: { id },
            data: {
              isExecuted: true,
              executedDate: new Date()
            }
          })

          // Handle account balance updates based on transaction type
          if (scheduledTransaction.type === "TRANSFER") {
            // Transfer: decrease from account, increase to account
            if (scheduledTransaction.fromAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.fromAccountId },
                data: {
                  balance: {
                    decrement: scheduledTransaction.amount
                  }
                }
              })
            }

            if (scheduledTransaction.toAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.toAccountId },
                data: {
                  balance: {
                    increment: scheduledTransaction.amount
                  }
                }
              })
            }
          } else if (scheduledTransaction.type === "INCOME") {
            // Income: increase to account balance
            if (scheduledTransaction.toAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.toAccountId },
                data: {
                  balance: {
                    increment: scheduledTransaction.amount
                  }
                }
              })
            }

            // Create a regular transaction record for income
            await tx.transaction.create({
              data: {
                amount: scheduledTransaction.amount,
                currency: scheduledTransaction.currency,
                description: scheduledTransaction.description,
                type: "INCOME",
                toAccountId: scheduledTransaction.toAccountId,
                userId: scheduledTransaction.userId,
                date: new Date()
              }
            })
          } else if (scheduledTransaction.type === "EXPENSE") {
            // Expense: decrease from account balance
            if (scheduledTransaction.fromAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.fromAccountId },
                data: {
                  balance: {
                    decrement: scheduledTransaction.amount
                  }
                }
              })
            }

            // Create a regular transaction record for expense
            await tx.transaction.create({
              data: {
                amount: scheduledTransaction.amount,
                currency: scheduledTransaction.currency,
                description: scheduledTransaction.description,
                type: "EXPENSE",
                fromAccountId: scheduledTransaction.fromAccountId,
                userId: scheduledTransaction.userId,
                date: new Date()
              }
            })
          }

          return updatedTransaction
        })

        return NextResponse.json({
          message: "Transaction executed successfully",
          scheduledTransaction: result
        })
      } else if (requestData.action === "undo") {
        // Use a transaction to reverse both operations
        const result = await db.$transaction(async (tx) => {
          // Mark as not executed and clear execution date
          const updatedTransaction = await tx.scheduledTransaction.update({
            where: { id },
            data: {
              isExecuted: false,
              executedDate: null
            }
          })

          // Handle account balance reversal based on transaction type
          if (scheduledTransaction.type === "TRANSFER") {
            // Transfer reversal: increase from account, decrease to account
            if (scheduledTransaction.fromAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.fromAccountId },
                data: {
                  balance: {
                    increment: scheduledTransaction.amount
                  }
                }
              })
            }

            if (scheduledTransaction.toAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.toAccountId },
                data: {
                  balance: {
                    decrement: scheduledTransaction.amount
                  }
                }
              })
            }
          } else if (scheduledTransaction.type === "INCOME") {
            // Income reversal: decrease to account balance
            if (scheduledTransaction.toAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.toAccountId },
                data: {
                  balance: {
                    decrement: scheduledTransaction.amount
                  }
                }
              })
            }

            // Remove the transaction record created for income
            await tx.transaction.deleteMany({
              where: {
                amount: scheduledTransaction.amount,
                description: scheduledTransaction.description,
                type: "INCOME",
                toAccountId: scheduledTransaction.toAccountId,
                userId: scheduledTransaction.userId
              }
            })
          } else if (scheduledTransaction.type === "EXPENSE") {
            // Expense reversal: increase from account balance
            if (scheduledTransaction.fromAccountId) {
              await tx.account.update({
                where: { id: scheduledTransaction.fromAccountId },
                data: {
                  balance: {
                    increment: scheduledTransaction.amount
                  }
                }
              })
            }

            // Remove the transaction record created for expense
            await tx.transaction.deleteMany({
              where: {
                amount: scheduledTransaction.amount,
                description: scheduledTransaction.description,
                type: "EXPENSE",
                fromAccountId: scheduledTransaction.fromAccountId,
                userId: scheduledTransaction.userId
              }
            })
          }

          return updatedTransaction
        })

        return NextResponse.json({
          message: "Transaction execution undone successfully",
          scheduledTransaction: result
        })
      } else {
        return NextResponse.json(
          { error: "Invalid action. Use 'execute' or 'undo'" },
          { status: 400 }
        )
      }
    } else {
      // This is a regular update
      const { description, amount, currency, type, fromAccountId, toAccountId, scheduledDate, frequency } = requestData

      const updateData: any = {}
      if (description !== undefined) updateData.description = description
      if (amount !== undefined) updateData.amount = parseFloat(amount)
      if (currency !== undefined) updateData.currency = currency
      if (type !== undefined) updateData.type = type
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
