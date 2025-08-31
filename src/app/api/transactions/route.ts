import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const categoryId = searchParams.get("categoryId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = { userId }
    
    if (type) {
      where.type = type
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        category: true,
        fromAccount: true,
        toAccount: true
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      transactions
    })

  } catch (error) {
    console.error("Transactions fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { description, amount, type, categoryId, date, recurring, frequency, currency, fromAccountId, toAccountId } = await request.json()

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { error: "Description, amount, type, and date are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Use a transaction to ensure both operations succeed or fail together
    const result = await db.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
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
          toAccountId: toAccountId || null,
          userId
        },
        include: {
          category: true
        }
      })

      // Update account balances if account IDs are provided
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
      message: "Transaction created successfully",
      transaction: result
    })

  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}