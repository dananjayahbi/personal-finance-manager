import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const scheduledTransactions = await db.scheduledTransaction.findMany({
      where: { userId },
      orderBy: { scheduledDate: "desc" }
    })

    return NextResponse.json({
      scheduledTransactions
    })

  } catch (error) {
    console.error("Scheduled transactions fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      description, 
      amount, 
      currency, 
      type,
      fromAccountId, 
      toAccountId, 
      scheduledDate, 
      frequency 
    } = await request.json()

    if (!description || !amount || !scheduledDate) {
      return NextResponse.json(
        { error: "Description, amount, and scheduledDate are required" },
        { status: 400 }
      )
    }

    // Validate account requirements based on transaction type
    if (type === "TRANSFER" && (!fromAccountId || !toAccountId)) {
      return NextResponse.json(
        { error: "Both fromAccountId and toAccountId are required for TRANSFER transactions" },
        { status: 400 }
      )
    }

    if (type === "INCOME" && !toAccountId) {
      return NextResponse.json(
        { error: "toAccountId is required for INCOME transactions" },
        { status: 400 }
      )
    }

    if (type === "EXPENSE" && !fromAccountId) {
      return NextResponse.json(
        { error: "fromAccountId is required for EXPENSE transactions" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const scheduledTransaction = await db.scheduledTransaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        currency: currency || "LKR",
        type: type || "TRANSFER",
        fromAccountId: fromAccountId || null,
        toAccountId: toAccountId || null,
        scheduledDate: new Date(scheduledDate),
        frequency: frequency || "once",
        userId
      }
    })

    return NextResponse.json({
      message: "Scheduled transaction created successfully",
      scheduledTransaction
    })

  } catch (error) {
    console.error("Scheduled transaction creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
