import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll use a hardcoded user ID
    // In production, this would come from authentication
    const userId = 'user-1'
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Optional filter by activity type
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build filter conditions
    const where: any = { userId }
    if (type) {
      where.type = type
    }
    
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    
    // Transform activities to match the frontend interface
    const transformedActivities = activities.map(activity => {
      let metadata: any = {}
      try {
        metadata = activity.metadata ? JSON.parse(activity.metadata) : {}
      } catch (e) {
        console.warn('Invalid metadata JSON:', activity.metadata)
      }
      
      return {
        id: activity.id,
        type: activity.type.toLowerCase().replace('_', '_'), // Keep enum format
        title: getActivityTitle(activity.type, metadata),
        description: activity.description,
        amount: metadata.amount || undefined,
        account: metadata.account || undefined,
        category: metadata.category || undefined,
        status: metadata.status || 'completed',
        timestamp: activity.createdAt,
        metadata
      }
    })
    
    return NextResponse.json({ 
      activities: transformedActivities,
      total: transformedActivities.length 
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, we'll use a hardcoded user ID
    const userId = 'user-1'
    
    const body = await request.json()
    const { type, description, metadata = {} } = body
    
    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      )
    }
    
    const activity = await prisma.activity.create({
      data: {
        userId,
        type: type.toUpperCase(),
        description,
        metadata: JSON.stringify(metadata)
      }
    })
    
    const parsedMetadata: any = metadata
    
    return NextResponse.json({ 
      activity: {
        id: activity.id,
        type: activity.type.toLowerCase(),
        title: getActivityTitle(activity.type, parsedMetadata),
        description: activity.description,
        amount: parsedMetadata.amount || undefined,
        account: parsedMetadata.account || undefined,
        category: parsedMetadata.category || undefined,
        status: parsedMetadata.status || 'completed',
        timestamp: activity.createdAt,
        metadata: parsedMetadata
      }
    })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

function getActivityTitle(type: string, metadata: any): string {
  switch (type) {
    case 'TRANSACTION_CREATED':
      return metadata.transactionType === 'INCOME' ? 'Income Received' : 'Payment Made'
    case 'TRANSACTION_UPDATED':
      return 'Transaction Updated'
    case 'TRANSACTION_DELETED':
      return 'Transaction Deleted'
    case 'ACCOUNT_CREATED':
      return 'Account Created'
    case 'ACCOUNT_UPDATED':
      return 'Account Updated'
    case 'BILL_CREATED':
      return 'Bill Added'
    case 'BILL_PAID':
      return 'Bill Paid'
    case 'GOAL_CREATED':
      return 'Goal Created'
    case 'GOAL_UPDATED':
      return 'Goal Progress Updated'
    case 'BUDGET_CREATED':
      return 'Budget Created'
    case 'BUDGET_UPDATED':
      return 'Budget Updated'
    default:
      return 'Activity'
  }
}
