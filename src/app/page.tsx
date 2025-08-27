"use client"

import { useAuth } from "@/contexts/auth-context"
import AuthForm from "@/components/auth-form"
import TransactionList from "@/components/transaction-list"
import TransactionForm from "@/components/transaction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, Plus, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

function Dashboard() {
  const { user, logout } = useAuth()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [financialOverview, setFinancialOverview] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netWorth: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      
      // Fetch transactions for the current month
      const response = await fetch("/api/transactions")
      const data = await response.json()

      if (response.ok) {
        const transactions = data.transactions
        setRecentTransactions(transactions.slice(0, 5))

        // Calculate financial overview
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()

        const monthlyTransactions = transactions.filter((t: any) => {
          const transactionDate = new Date(t.date)
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear
        })

        const monthlyIncome = monthlyTransactions
          .filter((t: any) => t.type === "INCOME")
          .reduce((sum: number, t: any) => sum + t.amount, 0)

        const monthlyExpenses = monthlyTransactions
          .filter((t: any) => t.type === "EXPENSE")
          .reduce((sum: number, t: any) => sum + t.amount, 0)

        const totalBalance = transactions.reduce((sum: number, t: any) => {
          return t.type === "INCOME" ? sum + t.amount : sum - t.amount
        }, 0)

        setFinancialOverview({
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          netWorth: totalBalance * 7 // Simplified net worth calculation
        })
      }
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for charts (in a real app, this would be calculated from actual data)
  const expenseData = [
    { name: "Food", value: 325, color: "#8884d8" },
    { name: "Transport", value: 180, color: "#82ca9d" },
    { name: "Entertainment", value: 150, color: "#ffc658" },
    { name: "Utilities", value: 210, color: "#ff7c7c" },
    { name: "Other", value: 135, color: "#8dd1e1" }
  ]

  const netWorthData = [
    { month: "Aug", worth: 75000 },
    { month: "Sep", worth: 78000 },
    { month: "Oct", worth: 81000 },
    { month: "Nov", worth: 83500 },
    { month: "Dec", worth: 86000 },
    { month: "Jan", worth: financialOverview.netWorth }
  ]

  const budgetProgress = [
    { category: "Food", budget: 500, spent: 325, progress: 65 },
    { category: "Transport", budget: 300, spent: 180, progress: 60 },
    { category: "Entertainment", budget: 200, spent: 150, progress: 75 },
    { category: "Utilities", budget: 250, spent: 210, progress: 84 }
  ]

  const goals = [
    { name: "Emergency Fund", target: 10000, current: 7500, progress: 75 },
    { name: "Vacation", target: 3000, current: 1200, progress: 40 },
    { name: "New Car", target: 25000, current: 8500, progress: 34 }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email}! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowTransactionForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialOverview.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialOverview.monthlyIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialOverview.monthlyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                -3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialOverview.netWorth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last year
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Expense Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Your spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value}`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Net Worth Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Net Worth Trend</CardTitle>
                  <CardDescription>Your net worth over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={netWorthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="worth" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {transaction.category?.icon && (
                              <span className="text-lg">{transaction.category.icon}</span>
                            )}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.category?.name || "Uncategorized"} • {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.type === "INCOME" ? "+" : "-"}{Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <Badge variant={transaction.type === "INCOME" ? "default" : "secondary"} className="text-xs">
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {recentTransactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions yet. Add your first transaction to get started!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <TransactionList onTransactionUpdate={fetchFinancialData} />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetProgress.map((budget) => (
                <Card key={budget.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {budget.category}
                      <Badge variant="outline">{budget.progress}%</Badge>
                    </CardTitle>
                    <CardDescription>
                      ${budget.spent} of ${budget.budget}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={budget.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      ${budget.budget - budget.spent} remaining
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <Card key={goal.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {goal.name}
                    </CardTitle>
                    <CardDescription>
                      ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={goal.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {goal.progress}% complete
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            categories={categories}
            onSubmit={() => {
              setShowTransactionForm(false)
              fetchFinancialData()
            }}
            onCancel={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <Dashboard />
}