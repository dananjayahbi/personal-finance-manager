import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = request.headers.get("x-user-id") || "user-1"

    // Get current date and calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

    // Fetch all data in parallel for better performance
    const [
      accounts,
      transactions,
      goals,
      bills,
      recentTransactions,
      monthlyTransactions
    ] = await Promise.all([
      // Get all accounts
      db.account.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
          icon: true
        }
      }),

      // Get recent transactions (last 30 days)
      db.transaction.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo }
        },
        include: {
          category: {
            select: { name: true, icon: true, type: true }
          },
          fromAccount: {
            select: { name: true, type: true }
          },
          toAccount: {
            select: { name: true, type: true }
          }
        },
        orderBy: { date: 'desc' }
      }),

      // Get all goals
      db.goal.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          targetAmount: true,
          currentAmount: true,
          deadline: true,
          currency: true
        }
      }),

      // Get bills
      db.bill.findMany({
        where: { userId },
        include: {
          category: {
            select: { name: true, icon: true }
          },
          account: {
            select: { name: true, type: true }
          }
        }
      }),

      // Get last 10 transactions for recent activity
      db.transaction.findMany({
        where: { userId },
        include: {
          category: {
            select: { name: true, icon: true, type: true }
          },
          fromAccount: {
            select: { name: true, type: true }
          },
          toAccount: {
            select: { name: true, type: true }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      }),

      // Get transactions for last 6 months for trends
      db.transaction.findMany({
        where: {
          userId,
          date: { gte: sixMonthsAgo }
        },
        include: {
          category: {
            select: { name: true, type: true }
          }
        },
        orderBy: { date: 'asc' }
      })
    ])

    // Calculate financial overview
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
    const assets = accounts.filter(a => a.balance > 0).reduce((sum, account) => sum + account.balance, 0)
    const liabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, account) => sum + account.balance, 0))
    const netWorth = assets - liabilities

    // Calculate monthly income and expenses (last 30 days)
    const monthlyIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthlyExpenses = Math.abs(transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0))

    // Count active goals and upcoming bills
    const activeGoals = goals.length
    const upcomingBills = bills.filter(b => !b.isPaid).length

    // Generate monthly trends (last 6 months)
    const monthlyTrends = generateMonthlyTrends(monthlyTransactions)

    // Generate expense categories for current month
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear()
    })
    const expenseCategories = generateExpenseCategories(currentMonthTransactions)

    // Generate weekly spending (last 7 days)
    const weeklyTransactions = transactions.filter(t => new Date(t.date) >= sevenDaysAgo)
    const weeklySpending = generateWeeklySpending(weeklyTransactions)

    // Process goals data
    const goalsProgress = goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      deadline: goal.deadline,
      currency: goal.currency
    }))

    // Format recent activity (top 5 most recent transactions)
    const recentActivity = recentTransactions.slice(0, 5).map(t => ({
      id: t.id,
      type: t.type.toLowerCase(),
      description: t.description || getTransactionDescription(t),
      amount: t.amount,
      date: t.date,
      category: t.category?.name || 'Other',
      categoryIcon: t.category?.icon || '💰'
    }))

    // Calculate account breakdown
    const accountBreakdown = accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      icon: account.icon || 'Wallet'
    }))

    const dashboardData = {
      financialOverview: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netWorth,
        totalAccounts: accounts.length,
        activeGoals,
        upcomingBills
      },
      charts: {
        monthlyTrends,
        expenseCategories,
        weeklySpending
      },
      goalsProgress,
      recentActivity,
      accountBreakdown,
      upcomingBills: bills
        .filter(b => !b.isPaid)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)
        .map(bill => ({
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.dueDate,
          category: bill.category?.name || 'Other',
          categoryIcon: bill.category?.icon || '📄',
          account: bill.account?.name || 'Unknown'
        }))
    }

    return NextResponse.json({ success: true, data: dashboardData })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function generateMonthlyTrends(transactions: any[]): Array<{month: string, income: number, expenses: number, savings: number}> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const trends: Array<{month: string, income: number, expenses: number, savings: number}> = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthIndex = date.getMonth()
    const year = date.getFullYear()

    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getMonth() === monthIndex && tDate.getFullYear() === year
    })

    const income = monthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = Math.abs(monthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0))

    trends.push({
      month: months[monthIndex],
      income,
      expenses,
      savings: income - expenses
    })
  }

  return trends
}

function generateExpenseCategories(transactions: any[]): Array<{name: string, value: number, color: string}> {
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
  const categoryTotals: { [key: string]: number } = {}

  expenseTransactions.forEach(t => {
    const categoryName = t.category?.name || 'Other'
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + Math.abs(t.amount)
  })

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']
  
  return Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 categories
}

function generateWeeklySpending(transactions: any[]): Array<{day: string, amount: number}> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const spending: Array<{day: string, amount: number}> = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.date)
      return tDate.toDateString() === date.toDateString() && t.type === 'EXPENSE'
    })

    const amount = Math.abs(dayTransactions.reduce((sum, t) => sum + t.amount, 0))
    const dayOfWeek = date.getDay()
    const dayName = days[dayOfWeek === 0 ? 6 : dayOfWeek - 1] // Adjust for Monday start

    spending.push({
      day: dayName,
      amount
    })
  }

  return spending
}

function getTransactionDescription(transaction: any): string {
  if (transaction.description) return transaction.description

  if (transaction.type === 'TRANSFER') {
    const fromAccount = transaction.fromAccount?.name || 'Unknown'
    const toAccount = transaction.toAccount?.name || 'Unknown'
    return `Transfer from ${fromAccount} to ${toAccount}`
  }

  if (transaction.type === 'INCOME') {
    return transaction.category?.name || 'Income'
  }

  if (transaction.type === 'EXPENSE') {
    return transaction.category?.name || 'Expense'
  }

  return 'Transaction'
}
