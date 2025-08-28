"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import TransactionForm from "@/components/transaction-form"
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
  Users,
  Activity
} from "lucide-react"

interface DashboardContentProps {
  className?: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const mockData = {
  monthlyTrends: [
    { month: 'Jan', income: 4200, expenses: 2800, savings: 1400 },
    { month: 'Feb', income: 4500, expenses: 3200, savings: 1300 },
    { month: 'Mar', income: 4800, expenses: 3100, savings: 1700 },
    { month: 'Apr', income: 4600, expenses: 2900, savings: 1700 },
    { month: 'May', income: 5200, expenses: 3400, savings: 1800 },
    { month: 'Jun', income: 5500, expenses: 3600, savings: 1900 },
  ],
  expenseCategories: [
    { name: 'Food & Dining', value: 1200, color: '#3B82F6' },
    { name: 'Transportation', value: 800, color: '#10B981' },
    { name: 'Shopping', value: 600, color: '#F59E0B' },
    { name: 'Entertainment', value: 400, color: '#EF4444' },
    { name: 'Bills & Utilities', value: 900, color: '#8B5CF6' },
    { name: 'Healthcare', value: 300, color: '#06B6D4' },
  ],
  weeklySpending: [
    { day: 'Mon', amount: 150 },
    { day: 'Tue', amount: 230 },
    { day: 'Wed', amount: 180 },
    { day: 'Thu', amount: 290 },
    { day: 'Fri', amount: 340 },
    { day: 'Sat', amount: 420 },
    { day: 'Sun', amount: 280 },
  ],
}

export default function DashboardContent({ className }: DashboardContentProps) {
  const { user } = useAuth()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [categories, setCategories] = useState([
    { id: "1", name: "Food & Dining", type: "EXPENSE", icon: "🍔" },
    { id: "2", name: "Transportation", type: "EXPENSE", icon: "🚗" },
    { id: "3", name: "Shopping", type: "EXPENSE", icon: "🛍️" },
    { id: "4", name: "Entertainment", type: "EXPENSE", icon: "🎬" },
    { id: "5", name: "Bills & Utilities", type: "EXPENSE", icon: "💡" },
    { id: "6", name: "Healthcare", type: "EXPENSE", icon: "🏥" },
    { id: "7", name: "Salary", type: "INCOME", icon: "💼" },
    { id: "8", name: "Freelance", type: "INCOME", icon: "💻" },
    { id: "9", name: "Investment", type: "INCOME", icon: "📈" }
  ])
  const [financialOverview, setFinancialOverview] = useState({
    totalBalance: 15420.50,
    monthlyIncome: 5500,
    monthlyExpenses: 3600,
    netWorth: 45890.75,
    totalAccounts: 4,
    activeGoals: 3,
    upcomingBills: 5
  })

  const handleTransactionSubmit = async (transaction: any) => {
    // Here you would typically save to database
    console.log("Transaction submitted:", transaction)
    setShowTransactionForm(false)
    // You could refresh financial data here
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
                ${financialOverview.totalBalance.toLocaleString()}
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
                ${financialOverview.monthlyIncome.toLocaleString()}
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
                ${financialOverview.monthlyExpenses.toLocaleString()}
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
                ${financialOverview.netWorth.toLocaleString()}
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
              <div className="text-2xl font-bold">{financialOverview.totalAccounts}</div>
              <p className="text-xs text-muted-foreground">2 primary, 2 savings</p>
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
              <div className="text-2xl font-bold">{financialOverview.activeGoals}</div>
              <p className="text-xs text-muted-foreground">1 near completion</p>
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
              <div className="text-2xl font-bold">{financialOverview.upcomingBills}</div>
              <p className="text-xs text-muted-foreground">3 due this week</p>
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
                <AreaChart data={mockData.monthlyTrends}>
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
                    data={mockData.expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockData.expenseCategories.map((entry, index) => (
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
                <BarChart data={mockData.weeklySpending}>
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
              <CardTitle>Savings Goals Progress</CardTitle>
              <CardDescription>Track your financial goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Emergency Fund</span>
                  <span className="text-sm text-muted-foreground">$8,500 / $10,000</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vacation Fund</span>
                  <span className="text-sm text-muted-foreground">$2,100 / $5,000</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Car Down Payment</span>
                  <span className="text-sm text-muted-foreground">$12,000 / $15,000</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'expense', description: 'Grocery shopping at Whole Foods', amount: -125.50, time: '2 hours ago' },
                { type: 'income', description: 'Salary deposit from TechCorp', amount: 4500.00, time: '1 day ago' },
                { type: 'transfer', description: 'Transfer to Savings Account', amount: -500.00, time: '2 days ago' },
                { type: 'expense', description: 'Netflix subscription', amount: -15.99, time: '3 days ago' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'income' ? 'bg-green-500' :
                      activity.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            categories={categories}
            onSubmit={handleTransactionSubmit}
            onCancel={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
