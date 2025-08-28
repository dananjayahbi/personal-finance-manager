"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import {
  Plus,
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  description?: string
  isActive: boolean
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "BANK",
    balance: 0,
    currency: "USD",
    description: ""
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    // Mock data for now
    const mockAccounts: Account[] = [
      {
        id: "1",
        name: "Main Checking",
        type: "BANK",
        balance: 5420.50,
        currency: "USD",
        description: "Primary checking account",
        isActive: true
      },
      {
        id: "2",
        name: "Savings Account",
        type: "SAVINGS",
        balance: 12500.00,
        currency: "USD",
        description: "Emergency fund savings",
        isActive: true
      },
      {
        id: "3",
        name: "Cash Wallet",
        type: "CASH",
        balance: 280.00,
        currency: "USD",
        description: "Physical cash on hand",
        isActive: true
      },
      {
        id: "4",
        name: "Credit Card",
        type: "CREDIT_CARD",
        balance: -1250.75,
        currency: "USD",
        description: "Visa rewards card",
        isActive: true
      }
    ]
    setAccounts(mockAccounts)
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return <Banknote className="h-6 w-6" />
      case "BANK":
        return <Wallet className="h-6 w-6" />
      case "CREDIT_CARD":
        return <CreditCard className="h-6 w-6" />
      case "SAVINGS":
        return <PiggyBank className="h-6 w-6" />
      case "INVESTMENT":
        return <TrendingUp className="h-6 w-6" />
      default:
        return <Wallet className="h-6 w-6" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "CASH":
        return "bg-green-100 text-green-800 border-green-200"
      case "BANK":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CREDIT_CARD":
        return "bg-red-100 text-red-800 border-red-200"
      case "SAVINGS":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "INVESTMENT":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAddAccount = async () => {
    // In a real app, this would make an API call
    const account: Account = {
      id: Date.now().toString(),
      ...newAccount,
      isActive: true
    }
    setAccounts([...accounts, account])
    setNewAccount({
      name: "",
      type: "BANK",
      balance: 0,
      currency: "USD",
      description: ""
    })
    setShowAddForm(false)
  }

  const totalBalance = accounts
    .filter(account => account.type !== "CREDIT_CARD")
    .reduce((sum, account) => sum + account.balance, 0)

  const totalDebt = accounts
    .filter(account => account.type === "CREDIT_CARD" && account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0)

  const netWorth = totalBalance - totalDebt

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
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground">
              Manage your financial accounts and track balances
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showBalances ? "Hide" : "Show"} Balances
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {showBalances ? `$${totalBalance.toLocaleString()}` : "•••••"}
              </div>
              <p className="text-xs text-green-600">+5.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {showBalances ? `$${totalDebt.toLocaleString()}` : "•••••"}
              </div>
              <p className="text-xs text-red-600">-2.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {showBalances ? `$${netWorth.toLocaleString()}` : "•••••"}
              </div>
              <p className="text-xs text-blue-600">+8.7% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accounts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getAccountTypeColor(account.type)}`}>
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge variant="outline" className={getAccountTypeColor(account.type)}>
                        {account.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      <span className={`text-xl font-bold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {showBalances 
                          ? `${account.balance >= 0 ? '+' : ''}$${Math.abs(account.balance).toLocaleString()}`
                          : "•••••"
                        }
                      </span>
                    </div>
                    {account.description && (
                      <p className="text-sm text-muted-foreground">{account.description}</p>
                    )}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Account Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="e.g., Main Checking Account"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({...newAccount, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Account</SelectItem>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="INVESTMENT">Investment Account</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newAccount.currency}
                  onValueChange={(value) => setNewAccount({...newAccount, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                  placeholder="Add a description for this account..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAccount} disabled={!newAccount.name}>
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
