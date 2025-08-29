import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    const accounts = await db.account.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({
      accounts
    })

  } catch (error) {
    console.error("Accounts fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, balance, currency, description } = await request.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Check if account with this name already exists for this user
    const existingAccount = await db.account.findFirst({
      where: { name, userId }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account with this name already exists" },
        { status: 409 }
      )
    }

    const account = await db.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance) || 0,
        currency: currency || "USD",
        description: description || null,
        isActive: true,
        userId
      }
    })

    return NextResponse.json({
      message: "Account created successfully",
      account
    })

  } catch (error) {
    console.error("Account creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
