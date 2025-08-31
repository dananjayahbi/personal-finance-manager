import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Count unpaid bills (not executed)
    const unpaidBillsCount = await db.bill.count({
      where: { 
        userId,
        isPaid: false
      }
    })

    return NextResponse.json({
      count: unpaidBillsCount
    })

  } catch (error) {
    console.error("Bills count fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
