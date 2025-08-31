import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const bills = await db.bill.findMany({
      where: { userId },
      include: {
        category: true,
        account: true,
        transaction: true
      },
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
    const { name, amount, currency, dueDate, frequency, categoryId, categoryName, accountId, description, isRecurring } = await request.json()

    if (!name || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Name, amount, and due date are required" },
        { status: 400 }
      )
    }

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

    // Validate accountId if provided
    if (accountId) {
      const accountExists = await db.account.findFirst({
        where: { id: accountId, userId }
      })
      
      if (!accountExists) {
        return NextResponse.json(
          { error: `Invalid account selected: ${accountId}` },
          { status: 400 }
        )
      }
    }

    const bill = await db.bill.create({
      data: {
        name,
        amount: parseFloat(amount),
        currency: currency || "LKR",
        dueDate: new Date(dueDate),
        frequency: frequency || "MONTHLY",
        categoryId: finalCategoryId,
        accountId: accountId || null,
        description: description || "",
        isRecurring: isRecurring || false,
        isPaid: false,
        userId
      },
      include: {
        category: true,
        account: true,
        transaction: true
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
