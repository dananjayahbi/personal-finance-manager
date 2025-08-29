import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const { name, type, balance, currency, description, isActive } = await request.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from the session and verify ownership
    const userId = request.headers.get("x-user-id") || "user-1"

    const existingAccount = await db.account.findFirst({
      where: { id, userId }
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    const account = await db.account.update({
      where: { id },
      data: {
        name,
        type,
        balance: parseFloat(balance),
        currency: currency || "USD",
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({
      message: "Account updated successfully",
      account
    })

  } catch (error) {
    console.error("Account update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // In a real app, you would get the user ID from the session and verify ownership
    const userId = request.headers.get("x-user-id") || "user-1"

    const existingAccount = await db.account.findFirst({
      where: { id, userId }
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    await db.account.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Account deleted successfully"
    })

  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
