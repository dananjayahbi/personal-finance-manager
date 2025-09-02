import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/token
    const userId = "user-1" // Using the seeded demo user ID

    const data = await request.json()
    const { currentPassword, newPassword } = data

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if current password verification is needed
    const isDemoUser = user.email === "demo@example.com"
    
    // Verify current password if provided and user is not demo user
    if (!isDemoUser && currentPassword && user.passwordHash) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    } else if (!isDemoUser && !currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    })

    return NextResponse.json({ 
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
