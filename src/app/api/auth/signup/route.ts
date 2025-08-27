import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, currency } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        preferredCurrency: currency || "USD"
      }
    })

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user

    // Create default categories for the user
    const defaultCategories = [
      { name: "Food", type: "EXPENSE" as const, icon: "🍔", color: "#ff6b6b" },
      { name: "Transport", type: "EXPENSE" as const, icon: "🚗", color: "#4ecdc4" },
      { name: "Utilities", type: "EXPENSE" as const, icon: "💡", color: "#45b7d1" },
      { name: "Entertainment", type: "EXPENSE" as const, icon: "🎬", color: "#f9ca24" },
      { name: "Healthcare", type: "EXPENSE" as const, icon: "🏥", color: "#6c5ce7" },
      { name: "Shopping", type: "EXPENSE" as const, icon: "🛍️", color: "#fd79a8" },
      { name: "Salary", type: "INCOME" as const, icon: "💰", color: "#00b894" },
      { name: "Freelance", type: "INCOME" as const, icon: "💻", color: "#00cec9" },
      { name: "Investment", type: "INCOME" as const, icon: "📈", color: "#fdcb6e" },
      { name: "Other Income", type: "INCOME" as const, icon: "💎", color: "#e17055" }
    ]

    await db.category.createMany({
      data: defaultCategories.map(category => ({
        ...category,
        userId: user.id
      }))
    })

    return NextResponse.json({
      message: "Account created successfully",
      user: userWithoutPassword
    })

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}