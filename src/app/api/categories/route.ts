import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "default-user-id"

    const categories = await db.category.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({
      categories
    })

  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, icon, color } = await request.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "default-user-id"

    // Check if category with this name already exists for this user
    const existingCategory = await db.category.findFirst({
      where: { name, userId }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        type,
        icon: icon || "📝",
        color: color || "#6b7280",
        userId
      }
    })

    return NextResponse.json({
      message: "Category created successfully",
      category
    })

  } catch (error) {
    console.error("Category creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}