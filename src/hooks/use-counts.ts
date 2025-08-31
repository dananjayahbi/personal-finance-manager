import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface CountData {
  billsCount: number
  scheduledTransactionsCount: number
  notificationsCount: number
}

export function useCounts() {
  const [counts, setCounts] = useState<CountData>({
    billsCount: 0,
    scheduledTransactionsCount: 0,
    notificationsCount: 5 // Keep static for now
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchCounts = async () => {
    try {
      setLoading(true)
      
      // For personal finance app, always use 'user-1' as this is single-user app
      const userId = 'user-1'
      
      // Fetch bills count
      const billsResponse = await fetch('/api/bills/count', {
        headers: {
          'x-user-id': userId
        }
      })
      const billsData = await billsResponse.json()

      // Fetch scheduled transactions count
      const transactionsResponse = await fetch('/api/scheduled-transactions/count', {
        headers: {
          'x-user-id': userId
        }
      })
      const transactionsData = await transactionsResponse.json()

      setCounts({
        billsCount: billsData.count || 0,
        scheduledTransactionsCount: transactionsData.count || 0,
        notificationsCount: 5 // Keep static for now
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, []) // Remove user dependency since we always use 'user-1'

  return {
    counts,
    loading,
    refetch: fetchCounts
  }
}
