"use client"

import { formatCurrency } from "@/lib/currency"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import {
  Plus,
  ArrowLeftRight,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Filter,
  Search,
  Download,
  Repeat,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  id: string
  type: "TRANSFER" | "INCOME" | "EXPENSE"
  amount: number
  currency: string
  description: string
  fromAccount?: string
  toAccount?: string
  scheduledDate?: Date
  executedDate?: Date
  frequency?: string
  isScheduled: boolean
  isExecuted: boolean
  category?: string
}

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [transactionType, setTransactionType] = useState<"TRANSFER" | "INCOME" | "EXPENSE">("TRANSFER")
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    amount: 0,
    currency: "LKR",
    description: "",
    fromAccount: "",
    toAccount: "",
    scheduledDate: new Date(),
    frequency: "once",
    category: ""
  })

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      
      if (response.ok) {
        setAccounts(data.accounts)
      } else {
        console.error('Failed to fetch accounts:', data.error)
        // Fall back to mock data
        const mockAccounts: Account[] = [
          { id: "1", name: "Main Checking", type: "BANK", balance: 5420.50 },
          { id: "2", name: "Savings Account", type: "SAVINGS", balance: 12500.00 },
          { id: "3", name: "Cash Wallet", type: "CASH", balance: 280.00 },
          { id: "4", name: "Credit Card", type: "CREDIT_CARD", balance: -1250.75 }
        ]
        setAccounts(mockAccounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      
      if (response.ok) {
        // Convert API transactions to the format expected by the page
        const convertedTransactions: Transaction[] = data.transactions.map((tx: any) => ({
          id: tx.id,
          type: tx.fromAccountId || tx.toAccountId ? "TRANSFER" : tx.type,
          amount: tx.amount,
          currency: tx.currency,
          description: tx.description,
          fromAccount: tx.fromAccount?.name || "",
          toAccount: tx.toAccount?.name || "",
          scheduledDate: new Date(tx.date),
          executedDate: new Date(tx.date),
          frequency: tx.frequency || "once",
          isScheduled: tx.recurring,
          isExecuted: true,
          category: tx.category?.name || ""
        }))
        setTransactions(convertedTransactions)
      } else {
        console.error('Failed to fetch transactions:', data.error)
        // Fall back to mock data if needed
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleAddTransaction = async () => {
    try {
      const transactionData = {
        description: newTransaction.description,
        amount: newTransaction.amount,
        currency: newTransaction.currency,
        type: transactionType,
        recurring: newTransaction.frequency !== "once",
        frequency: newTransaction.frequency !== "once" ? newTransaction.frequency : null,
        date: newTransaction.scheduledDate.toISOString()
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh transactions list
        fetchTransactions()
        setNewTransaction({
          amount: 0,
          currency: "LKR",
          description: "",
          fromAccount: "",
          toAccount: "",
          scheduledDate: new Date(),
          frequency: "once",
          category: ""
        })
        setShowAddForm(false)
      } else {
        console.error('Failed to add transaction:', data.error)
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const executeTransaction = (transactionId: string) => {
    setTransactions(transactions.map(transaction => 
      transaction.id === transactionId 
        ? { ...transaction, isExecuted: true, executedDate: new Date() }
        : transaction
    ))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "TRANSFER":
        return <ArrowLeftRight className="h-4 w-4" />
      case "INCOME":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "EXPENSE":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      default:
        return <ArrowLeftRight className="h-4 w-4" />
    }
  }

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(transactions.map(t => t.id))
    }
  }

  const handleDeleteSelected = async () => {
    try {
      // Delete each selected transaction
      const deletePromises = selectedTransactions.map(id =>
        fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // Refresh transactions list
      fetchTransactions()
      setSelectedTransactions([])
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting transactions:', error)
    }
  }

  const handleClearAll = async () => {
    try {
      // Get all transaction IDs and delete them
      const deletePromises = transactions.map(transaction =>
        fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // Refresh transactions list
      fetchTransactions()
      setShowClearAllDialog(false)
    } catch (error) {
      console.error('Error clearing all transactions:', error)
    }
  }

  const getStatusColor = (transaction: Transaction) => {
    if (transaction.isExecuted) return "bg-green-100 text-green-800 border-green-200"
    if (transaction.scheduledDate && transaction.scheduledDate < new Date()) {
      return "bg-red-100 text-red-800 border-red-200"
    }
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getStatusText = (transaction: Transaction) => {
    if (transaction.isExecuted) return "Executed"
    if (transaction.scheduledDate && transaction.scheduledDate < new Date()) {
      return "Overdue"
    }
    return "Scheduled"
  }

  const getDaysUntilExecution = (scheduledDate?: Date) => {
    if (!scheduledDate) return null
    const today = new Date()
    const diffTime = scheduledDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const totalScheduled = transactions
    .filter(t => !t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const executedThisMonth = transactions
    .filter(t => t.isExecuted && t.executedDate && t.executedDate.getMonth() === new Date().getMonth())
    .length

  const overdueTransactions = transactions
    .filter(t => !t.isExecuted && t.scheduledDate && t.scheduledDate < new Date())
    .length

  const recurringTransactions = transactions
    .filter(t => t.frequency !== "once")
    .length

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.isExecuted !== b.isExecuted) return a.isExecuted ? 1 : -1
    const dateA = a.scheduledDate || new Date()
    const dateB = b.scheduledDate || new Date()
    return dateA.getTime() - dateB.getTime()
  })

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
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Manage transfers between accounts and schedule future transactions
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {selectedTransactions.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedTransactions.length})
              </Button>
            )}
            {transactions.length > 0 && (
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={() => setShowClearAllDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Transaction
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-4"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totalScheduled, "LKR")}
              </div>
              <p className="text-xs text-blue-600">Pending execution</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executed This Month</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{executedThisMonth}</div>
              <p className="text-xs text-green-600">Completed transactions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{overdueTransactions}</div>
              <p className="text-xs text-red-600">Need attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recurring</CardTitle>
              <Repeat className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{recurringTransactions}</div>
              <p className="text-xs text-purple-600">Automated transfers</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Transfers</CardTitle>
                  <CardDescription>Manage your account transfers and scheduled transactions</CardDescription>
                </div>
                {transactions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedTransactions.length === transactions.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTransactions.map((transaction, index) => {
                  const daysUntil = getDaysUntilExecution(transaction.scheduledDate)
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                        transaction.isExecuted ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={() => handleSelectTransaction(transaction.id)}
                        />
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h4 className={`font-medium ${transaction.isExecuted ? 'line-through text-muted-foreground' : ''}`}>
                            {transaction.description}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{transaction.fromAccount}</span>
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>{transaction.toAccount}</span>
                            {transaction.frequency !== "once" && (
                              <Badge variant="secondary" className="text-xs">
                                <Repeat className="mr-1 h-3 w-3" />
                                {transaction.frequency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(transaction.amount, transaction.currency || "LKR")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.isExecuted && transaction.executedDate
                              ? `Executed: ${format(transaction.executedDate, "MMM dd")}`
                              : transaction.scheduledDate
                                ? `Scheduled: ${format(transaction.scheduledDate, "MMM dd")}`
                                : "No date set"
                            }
                          </div>
                        </div>

                        <Badge variant="outline" className={getStatusColor(transaction)}>
                          {getStatusText(transaction)}
                        </Badge>

                        {!transaction.isExecuted && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => executeTransaction(transaction.id)}
                              disabled={transaction.isExecuted}
                            >
                              Execute Now
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No scheduled transactions found.</p>
                  <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Your First Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Transaction</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Transaction Type</Label>
                <div className="flex space-x-2">
                  {["TRANSFER", "INCOME", "EXPENSE"].map((type) => (
                    <Button
                      key={type}
                      variant={transactionType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransactionType(type as any)}
                    >
                      {type.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="e.g., Monthly savings transfer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (Rs.)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={newTransaction.currency}
                    onValueChange={(value) => setNewTransaction({...newTransaction, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {transactionType === "TRANSFER" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="from-account">From Account</Label>
                    <Select
                      value={newTransaction.fromAccount}
                      onValueChange={(value) => setNewTransaction({...newTransaction, fromAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.name}>
                            {account.name} (${account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="to-account">To Account</Label>
                    <Select
                      value={newTransaction.toAccount}
                      onValueChange={(value) => setNewTransaction({...newTransaction, toAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.name}>
                            {account.name} (${account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTransaction.scheduledDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTransaction.scheduledDate}
                      onSelect={(date) => date && setNewTransaction({...newTransaction, scheduledDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newTransaction.frequency}
                  onValueChange={(value) => setNewTransaction({...newTransaction, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddTransaction} 
                disabled={!newTransaction.description || newTransaction.amount <= 0}
              >
                Schedule Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Selected Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Selected Transactions</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete {selectedTransactions.length} selected transaction{selectedTransactions.length > 1 ? 's' : ''}? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSelected}>
                Delete {selectedTransactions.length} Transaction{selectedTransactions.length > 1 ? 's' : ''}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear All Confirmation Dialog */}
        <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Transactions</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete all {transactions.length} transactions? 
                This action cannot be undone and will permanently remove all transaction data.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowClearAllDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                Clear All Transactions
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
