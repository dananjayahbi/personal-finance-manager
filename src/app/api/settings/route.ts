import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/token
    const userId = "user-1" // Using the seeded demo user ID

    // Fetch user data including email
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let userSettings = await db.userSettings.findUnique({
      where: { userId },
      include: {
        goalsAccount: true, // Include the goals account data
      },
    })

    // If no settings exist, create default settings
    if (!userSettings) {
      userSettings = await db.userSettings.create({
        data: {
          userId,
          firstName: '',
          lastName: '',
          phone: '',
          currency: 'LKR',
          language: 'en',
          timezone: 'Asia/Colombo',
          dateFormat: 'DD/MM/YYYY',
          theme: 'light',
          twoFactorEnabled: false,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          billReminders: true,
          goalReminders: true,
          lowBalanceAlerts: true,
          budgetAlerts: true,
          goalsAccountId: null,
        },
        include: {
          goalsAccount: true,
        },
      })
    }

    // Combine user data with settings
    const settingsWithEmail = {
      ...userSettings,
      email: user.email,
    }

    return NextResponse.json({ settings: settingsWithEmail })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/token
    const userId = "user-1" // Using the seeded demo user ID

    const data = await request.json()

    // Use a transaction to update both User and UserSettings
    const result = await db.$transaction(async (tx) => {
      // Update user email if provided
      if (data.email) {
        await tx.user.update({
          where: { id: userId },
          data: {
            email: data.email,
          },
        })
      }

      // Update or create user settings
      const updatedSettings = await tx.userSettings.upsert({
        where: { userId },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          currency: data.currency,
          language: data.language,
          timezone: data.timezone,
          dateFormat: data.dateFormat,
          theme: data.theme,
          twoFactorEnabled: data.twoFactorEnabled,
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          smsNotifications: data.smsNotifications,
          billReminders: data.billReminders,
          goalReminders: data.goalReminders,
          lowBalanceAlerts: data.lowBalanceAlerts,
          budgetAlerts: data.budgetAlerts,
          goalsAccountId: data.goalsAccountId,
        },
        create: {
          userId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          currency: data.currency || 'LKR',
          language: data.language || 'en',
          timezone: data.timezone || 'Asia/Colombo',
          dateFormat: data.dateFormat || 'DD/MM/YYYY',
          theme: data.theme || 'light',
          twoFactorEnabled: data.twoFactorEnabled || false,
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
          pushNotifications: data.pushNotifications !== undefined ? data.pushNotifications : true,
          smsNotifications: data.smsNotifications || false,
          billReminders: data.billReminders !== undefined ? data.billReminders : true,
          goalReminders: data.goalReminders !== undefined ? data.goalReminders : true,
          lowBalanceAlerts: data.lowBalanceAlerts !== undefined ? data.lowBalanceAlerts : true,
          budgetAlerts: data.budgetAlerts !== undefined ? data.budgetAlerts : true,
          goalsAccountId: data.goalsAccountId || null,
        },
        include: {
          goalsAccount: true,
        },
      })

      return updatedSettings
    })

    return NextResponse.json({ 
      settings: {
        ...result,
        email: data.email || undefined,
      },
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}
