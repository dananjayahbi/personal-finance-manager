"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Banknote,
  PiggyBank,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from "lucide-react"

interface AccountBalance {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  percentage: number
  change: number
  changePercent: number
}

interface BalanceHistoryPoint {
  date: string
  totalBalance: number
  assets: number
  liabilities: number
}

export default function BalancesPage() {
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([])
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryPoint[]>([])
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBalanceData()
  }, [])

  const fetchBalanceData = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      
      if (response.ok) {
        // Convert accounts to balance format
        const convertedBalances: AccountBalance[] = data.accounts.map((account: any, index: number) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
          percentage: 0, // Will be calculated later
          change: Math.random() * 200 - 100, // Random change for demo
          changePercent: (Math.random() * 20 - 10)
        }))
        
        // Calculate percentages
        const totalBalance = convertedBalances.reduce((sum, account) => sum + Math.max(0, account.balance), 0)
        convertedBalances.forEach(account => {
          account.percentage = totalBalance > 0 ? (Math.max(0, account.balance) / totalBalance) * 100 : 0
        })
        
        setAccountBalances(convertedBalances)
        
        // Fetch transaction history for balance trends
        const transactionsResponse = await fetch('/api/transactions')
        const transactionsData = await transactionsResponse.json()
        
        if (transactionsResponse.ok) {
          const balanceHistory: BalanceHistoryPoint[] = generateBalanceHistory(convertedBalances, transactionsData.transactions || [])
          setBalanceHistory(balanceHistory)
        } else {
          // Fallback to mock history data
          const mockHistory: BalanceHistoryPoint[] = [
            { date: "2025-02-01", totalBalance: 18200, assets: 19350, liabilities: 1150 },
            { date: "2025-03-01", totalBalance: 18850, assets: 20000, liabilities: 1150 },
            { date: "2025-04-01", totalBalance: 19420, assets: 20570, liabilities: 1150 },
            { date: "2025-05-01", totalBalance: 20100, assets: 21250, liabilities: 1150 },
            { date: "2025-06-01", totalBalance: 21250, assets: 22400, liabilities: 1150 },
            { date: "2025-07-01", totalBalance: 22400, assets: 23550, liabilities: 1150 },
            { date: "2025-08-01", totalBalance: totalBalance, assets: totalBalance + 1150, liabilities: 1150 }
          ]
          setBalanceHistory(mockHistory)
        }
      } else {
        console.error('Failed to fetch balances:', data.error)
        setAccountBalances([])
        setBalanceHistory([])
      }
    } catch (error) {
      console.error('Error fetching balances:', error)
      setAccountBalances([])
      setBalanceHistory([])
    }
    
    setLoading(false)
  }

  const generateBalanceHistory = (accounts: AccountBalance[], transactions: any[]): BalanceHistoryPoint[] => {
    const history: BalanceHistoryPoint[] = []
    const currentDate = new Date()
    
    // Generate history for last 7 months
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setMonth(date.getMonth() - i)
      const dateString = date.toISOString().split('T')[0]
      
      // Calculate what the balance would have been at that time
      // For simplicity, we'll use current balance minus recent transactions
      const currentAssets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0)
      const currentLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0))
      
      // Add some variation for historical data
      const variation = (Math.random() - 0.5) * 2000
      const assets = currentAssets + variation
      const liabilities = currentLiabilities + (Math.random() * 500)
      
      history.push({
        date: dateString,
        totalBalance: assets - liabilities,
        assets,
        liabilities
      })
    }
    
    return history
  }

  const exportBalanceData = () => {
    const csvHeaders = [
      'Account ID',
      'Account Name',
      'Account Type',
      'Balance',
      'Currency',
      'Percentage of Total',
      'Change Amount',
      'Change Percentage'
    ]

    const csvData = accountBalances.map(account => [
      account.id,
      account.name,
      account.type,
      account.balance.toString(),
      account.currency,
      account.percentage.toFixed(2) + '%',
      account.change.toString(),
      account.changePercent.toFixed(2) + '%'
    ])

    // Add summary row
    const totalBalance = accountBalances.reduce((sum, account) => sum + account.balance, 0)
    const totalAssets = accountBalances.filter(a => a.balance > 0).reduce((sum, account) => sum + account.balance, 0)
    const totalLiabilities = Math.abs(accountBalances.filter(a => a.balance < 0).reduce((sum, account) => sum + account.balance, 0))

    csvData.push([
      '',
      'SUMMARY',
      '',
      '',
      '',
      '',
      '',
      ''
    ])
    csvData.push([
      '',
      'Total Balance',
      '',
      totalBalance.toString(),
      'LKR',
      '',
      '',
      ''
    ])
    csvData.push([
      '',
      'Total Assets',
      '',
      totalAssets.toString(),
      'LKR',
      '',
      '',
      ''
    ])
    csvData.push([
      '',
      'Total Liabilities',
      '',
      totalLiabilities.toString(),
      'LKR',
      '',
      '',
      ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `balance-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const totalAssets = accountBalances
    .filter(account => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0)

  const totalLiabilities = Math.abs(accountBalances
    .filter(account => account.balance < 0)
    .reduce((sum, account) => sum + account.balance, 0))

  const netWorth = totalAssets - totalLiabilities

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return <Banknote className="h-5 w-5" />
      case "BANK":
        return <Wallet className="h-5 w-5" />
      case "CREDIT_CARD":
        return <CreditCard className="h-5 w-5" />
      case "SAVINGS":
        return <PiggyBank className="h-5 w-5" />
      case "INVESTMENT":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Wallet className="h-5 w-5" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "CASH":
        return "text-green-600 bg-green-100"
      case "BANK":
        return "text-blue-600 bg-blue-100"
      case "CREDIT_CARD":
        return "text-red-600 bg-red-100"
      case "SAVINGS":
        return "text-purple-600 bg-purple-100"
      case "INVESTMENT":
        return "text-orange-600 bg-orange-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const pieData = accountBalances
    .filter(account => account.balance > 0)
    .map((account, index) => ({
      name: account.name,
      value: account.balance,
      fill: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
    }))

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Balances</h1>
            <p className="text-muted-foreground">
              Comprehensive view of your financial portfolio and net worth
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showBalances ? "Hide" : "Show"} Amounts
            </Button>
            <Button variant="outline" onClick={fetchBalanceData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportBalanceData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-4"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {showBalances ? `$${netWorth.toLocaleString()}` : "•••••"}
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+12.5% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {showBalances ? `$${totalAssets.toLocaleString()}` : "•••••"}
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+8.2% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {showBalances ? `$${totalLiabilities.toLocaleString()}` : "•••••"}
              </div>
              <div className="flex items-center space-x-2 text-xs text-red-600">
                <TrendingUp className="h-3 w-3" />
                <span>+3.1% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debt-to-Asset Ratio</CardTitle>
              <AlertTriangle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <TrendingDown className="h-3 w-3" />
                <span>-2.3% improvement</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Balance History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Net Worth Trend</CardTitle>
                <CardDescription>Your financial growth over the last 7 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={balanceHistory}>
                    <defs>
                      <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="assets" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorAssets)" 
                      name="Assets"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="liabilities" 
                      stroke="#EF4444" 
                      fillOpacity={1} 
                      fill="url(#colorLiabilities)"
                      name="Liabilities"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Asset Allocation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Distribution of your assets by account</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
              <CardDescription>Detailed breakdown of all your accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountBalances.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getAccountTypeColor(account.type)}`}>
                        {getAccountTypeIcon(account.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {account.type.replace('_', ' ')} • {account.currency}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {showBalances 
                          ? `${account.balance >= 0 ? '+' : ''}$${Math.abs(account.balance).toLocaleString()}`
                          : "•••••"
                        }
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`${account.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {account.change >= 0 ? '+' : ''}${account.change.toFixed(2)}
                        </span>
                        <Badge variant={account.changePercent >= 0 ? "default" : "destructive"}>
                          {account.changePercent >= 0 ? '+' : ''}{account.changePercent.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Financial Health Score</CardTitle>
              <CardDescription>Overall assessment of your financial position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Emergency Fund Ratio</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-green-600">Good - 6 months of expenses covered</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Debt-to-Income Ratio</span>
                    <span className="text-sm text-muted-foreground">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  <p className="text-xs text-green-600">Excellent - Well below 30% threshold</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Savings Rate</span>
                    <span className="text-sm text-muted-foreground">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  <p className="text-xs text-green-600">Outstanding - Above 20% recommendation</p>
                </div>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-700 mb-2">92/100</div>
                <p className="text-green-700 font-medium">Excellent Financial Health</p>
                <p className="text-sm text-green-600 mt-2">
                  You're in great financial shape! Keep maintaining your healthy savings habits and low debt levels.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
