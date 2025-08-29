import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/token
    const userId = "user-1" // Using the seeded demo user ID

    let userSettings = await db.userSettings.findUnique({
      where: { userId },
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
        },
      })
    }

    return NextResponse.json({ settings: userSettings })
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

    const updatedSettings = await db.userSettings.upsert({
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
      },
    })

    return NextResponse.json({ 
      settings: updatedSettings,
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
