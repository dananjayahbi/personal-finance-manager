import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Count unexecuted scheduled transactions
    const unexecutedTransactionsCount = await db.scheduledTransaction.count({
      where: { 
        userId,
        isExecuted: false
      }
    })

    return NextResponse.json({
      count: unexecutedTransactionsCount
    })

  } catch (error) {
    console.error("Scheduled transactions count fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
