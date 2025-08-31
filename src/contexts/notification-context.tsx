"use client"

import React, { createContext, useContext, useCallback } from 'react'
import { useCounts } from '@/hooks/use-counts'

interface NotificationContextType {
  counts: {
    billsCount: number
    scheduledTransactionsCount: number
    notificationsCount: number
  }
  loading: boolean
  refreshCounts: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { counts, loading, refetch } = useCounts()

  const refreshCounts = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <NotificationContext.Provider value={{ counts, loading, refreshCounts }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
