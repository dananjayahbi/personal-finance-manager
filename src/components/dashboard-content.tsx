"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import TransactionForm from "@/components/transaction-form"
import { formatCurrency } from "@/lib/currency"

interface Category {
  id: string
  name: string
  type: string
  icon: string
}

interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  savings: number
}

interface ExpenseCategory {
  name: string
  value: number
  color: string
}

interface WeeklySpending {
  day: string
  amount: number
}

interface GoalProgress {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  progress: number
  deadline: string | null
  currency: string
}

interface RecentActivity {
  id: string
  type: string
  description: string
  amount: number
  date: string
  category: string
  categoryIcon: string
}

interface UpcomingBill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  categoryIcon: string
  account: string
}

interface DashboardData {
  financialOverview: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
    netWorth: number
    totalAccounts: number
    activeGoals: number
    upcomingBills: number
  }
  charts: {
    monthlyTrends: MonthlyTrend[]
    expenseCategories: ExpenseCategory[]
    weeklySpending: WeeklySpending[]
  }
  goalsProgress: GoalProgress[]
  recentActivity: RecentActivity[]
  accountBreakdown: any[]
  upcomingBills: UpcomingBill[]
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Target,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  Users
} from "lucide-react"

interface DashboardContentProps {
  className?: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function DashboardContent({ className }: DashboardContentProps) {
  const { user } = useAuth()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const userId = user?.id || 'user-1'
      
      const response = await fetch('/api/dashboard', {
        headers: {
          'x-user-id': userId
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setDashboardData(result.data)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
      } else {
        console.error('Failed to fetch categories:', data.error)
        // Fall back to mock data
        setCategories([
          { id: "income-category-1", name: "Salary", type: "INCOME", icon: "💼" },
          { id: "expense-category-1", name: "Food & Dining", type: "EXPENSE", icon: "🍔" },
          { id: "2", name: "Transportation", type: "EXPENSE", icon: "🚗" },
          { id: "3", name: "Shopping", type: "EXPENSE", icon: "🛍️" },
          { id: "4", name: "Entertainment", type: "EXPENSE", icon: "🎬" },
          { id: "5", name: "Bills & Utilities", type: "EXPENSE", icon: "💡" },
          { id: "6", name: "Healthcare", type: "EXPENSE", icon: "🏥" },
          { id: "8", name: "Freelance", type: "INCOME", icon: "�" },
          { id: "9", name: "Investment", type: "INCOME", icon: "�" }
        ])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  
  const handleTransactionSubmit = async (transaction: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1'
        },
        body: JSON.stringify(transaction),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log("Transaction created successfully:", data.transaction)
        setShowTransactionForm(false)
        // Refresh dashboard data
        fetchDashboardData()
      } else {
        console.error('Failed to create transaction:', data.error)
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  if (loading || !dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for today, {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(dashboardData.financialOverview.totalBalance, 'LKR')}
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.5% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(dashboardData.financialOverview.monthlyIncome, 'LKR')}
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+8.2% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                {formatCurrency(dashboardData.financialOverview.monthlyExpenses, 'LKR')}
              </div>
              <div className="flex items-center space-x-2 text-xs text-red-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+3.1% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {formatCurrency(dashboardData.financialOverview.netWorth, 'LKR')}
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+15.3% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-3"
      >
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.financialOverview.totalAccounts}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.financialOverview.activeGoals}</div>
              <p className="text-xs text-muted-foreground">Goals in progress</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.financialOverview.upcomingBills}</div>
              <p className="text-xs text-muted-foreground">Bills pending</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Income vs Expenses Trend */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>Monthly income vs expenses comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.charts.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorExpenses)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Categories */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Current month spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.charts.expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.charts.expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Spending Pattern */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Spending Pattern</CardTitle>
              <CardDescription>Daily spending for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.charts.weeklySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Progress */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Goals Progress</CardTitle>
              <CardDescription>Track your financial goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.goalsProgress.length > 0 ? (
                dashboardData.goalsProgress.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                      </span>
                    </div>
                    <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No goals set yet</p>
                  <p className="text-xs text-muted-foreground">Create your first financial goal to track progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Upcoming Bills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Bills
            </CardTitle>
            <CardDescription>Bills due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingBills.length > 0 ? (
                dashboardData.upcomingBills.map((bill, index) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{bill.categoryIcon}</div>
                      <div>
                        <p className="text-sm font-medium">{bill.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Account: {bill.account}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(bill.amount, 'LKR')}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No upcoming bills</p>
                  <p className="text-xs text-muted-foreground">All bills are up to date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            categories={categories}
            onSubmit={handleTransactionSubmit}
            onCancel={() => setShowTransactionForm(false)}
            standalone={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
