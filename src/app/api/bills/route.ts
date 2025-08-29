import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const bills = await db.bill.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" }
    })

    return NextResponse.json({
      bills
    })

  } catch (error) {
    console.error("Bills fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, amount, currency, dueDate, frequency, categoryId, description, isRecurring } = await request.json()

    if (!name || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Name, amount, and due date are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const bill = await db.bill.create({
      data: {
        name,
        amount: parseFloat(amount),
        currency: currency || "USD",
        dueDate: new Date(dueDate),
        frequency: frequency || "MONTHLY",
        categoryId: categoryId || null,
        description: description || "",
        isRecurring: isRecurring || false,
        isPaid: false,
        userId
      }
    })

    return NextResponse.json({
      message: "Bill created successfully",
      bill
    })

  } catch (error) {
    console.error("Bill creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
