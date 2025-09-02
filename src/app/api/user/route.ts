import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/token
    const userId = "user-1" // Using the seeded demo user ID

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Combine user data with settings for a complete profile
    const fullName = user.settings?.firstName && user.settings?.lastName 
      ? `${user.settings.firstName} ${user.settings.lastName}`.trim()
      : user.name || 'Demo User'

    const userProfile = {
      id: user.id,
      email: user.email,
      name: fullName,
      firstName: user.settings?.firstName || '',
      lastName: user.settings?.lastName || '',
      phone: user.settings?.phone || '',
      preferredCurrency: user.settings?.currency || user.preferredCurrency,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
