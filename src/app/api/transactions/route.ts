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
        category: true
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
    const { description, amount, type, categoryId, date, recurring, frequency, currency } = await request.json()

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { error: "Description, amount, type, and date are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const transaction = await db.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        categoryId: categoryId || null,
        date: new Date(date),
        recurring: recurring || false,
        frequency: recurring ? frequency : null,
        currency: currency || "USD",
        userId
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      message: "Transaction created successfully",
      transaction
    })

  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}