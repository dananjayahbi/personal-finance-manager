import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, amount, currency, dueDate, frequency, categoryId, categoryName, accountId, description, isRecurring, isPaid } = await request.json()

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Handle category - either by ID or by name
    let finalCategoryId: string | null = null
    if (categoryId && categoryId !== "none") {
      // If categoryId is provided and not "none", use it directly
      finalCategoryId = categoryId
    } else if (categoryName && categoryName !== "none") {
      // If categoryName is provided, look up or create the category
      let category = await db.category.findFirst({
        where: { name: categoryName, userId }
      })
      
      if (!category) {
        // Create the category if it doesn't exist
        category = await db.category.create({
          data: {
            name: categoryName,
            type: "EXPENSE",
            userId
          }
        })
      }
      finalCategoryId = category.id
    }

    // Verify the bill belongs to the user
    const existingBill = await db.bill.findFirst({
      where: { id, userId },
      include: {
        account: true,
        transaction: true
      }
    })

    if (!existingBill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      )
    }

    // Handle bill execution logic
    let transactionId = existingBill.transactionId
    let newTransaction: any = null

    // If bill is being marked as paid and wasn't paid before
    if (isPaid && !existingBill.isPaid && existingBill.accountId) {
      try {
        // Create expense transaction
        const createdTransaction = await db.transaction.create({
          data: {
            amount: existingBill.amount,
            currency: existingBill.currency,
            description: `Bill payment: ${existingBill.name}`,
            type: 'EXPENSE',
            categoryId: existingBill.categoryId,
            fromAccountId: existingBill.accountId,
            userId: userId,
            date: new Date()
          }
        })

        // Update account balance
        await db.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              decrement: existingBill.amount
            }
          }
        })

        newTransaction = createdTransaction
        transactionId = createdTransaction.id
      } catch (error) {
        console.error('Error creating transaction for bill execution:', error)
        return NextResponse.json(
          { error: "Failed to execute bill payment" },
          { status: 500 }
        )
      }
    }
    
    // If bill is being marked as unpaid and was paid before (undo)
    else if (!isPaid && existingBill.isPaid && existingBill.transactionId && existingBill.accountId) {
      try {
        // Delete the transaction
        await db.transaction.delete({
          where: { id: existingBill.transactionId }
        })

        // Restore account balance
        await db.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        })

        transactionId = null
      } catch (error) {
        console.error('Error undoing bill payment:', error)
        return NextResponse.json(
          { error: "Failed to undo bill payment" },
          { status: 500 }
        )
      }
    }

    const bill = await db.bill.update({
      where: { id },
      data: {
        name: name || existingBill.name,
        amount: amount ? parseFloat(amount) : existingBill.amount,
        currency: currency || existingBill.currency,
        dueDate: dueDate ? new Date(dueDate) : existingBill.dueDate,
        frequency: frequency || existingBill.frequency,
        categoryId: finalCategoryId !== undefined ? finalCategoryId : existingBill.categoryId,
        accountId: accountId !== undefined ? accountId : existingBill.accountId,
        description: description !== undefined ? description : existingBill.description,
        isRecurring: isRecurring !== undefined ? isRecurring : existingBill.isRecurring,
        isPaid: isPaid !== undefined ? isPaid : existingBill.isPaid,
        transactionId: transactionId
      },
      include: {
        category: true,
        account: true,
        transaction: true
      }
    })

    return NextResponse.json({
      message: "Bill updated successfully",
      bill,
      transaction: newTransaction
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
