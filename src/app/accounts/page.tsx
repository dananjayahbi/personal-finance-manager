"use client"

import { formatCurrency } from "@/lib/currency"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
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
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "BANK",
    balance: 0,
    currency: "LKR",
    description: ""
  })

  useEffect(() => {
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
        // Fall back to mock data if API fails
        const mockAccounts: Account[] = [
          {
            id: "1",
            name: "Main Checking",
            type: "BANK",
            balance: 5420.50,
            currency: "LKR",
            description: "Primary checking account",
            isActive: true
          },
          {
            id: "2",
            name: "Savings Account",
            type: "SAVINGS",
            balance: 12500.00,
            currency: "LKR",
            description: "Emergency fund savings",
            isActive: true
          },
          {
            id: "3",
            name: "Cash Wallet",
            type: "CASH",
            balance: 280.00,
            currency: "LKR",
            description: "Physical cash on hand",
            isActive: true
          },
          {
            id: "4",
            name: "Credit Card",
            type: "CREDIT_CARD",
            balance: -1250.75,
            currency: "LKR",
            description: "Visa rewards card",
            isActive: true
          }
        ]
        setAccounts(mockAccounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return <Banknote className="h-6 w-6" />
      case "SAVINGS":
        return <PiggyBank className="h-6 w-6" />
      case "CREDIT_CARD":
        return <CreditCard className="h-6 w-6" />
      default:
        return <Wallet className="h-6 w-6" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "CASH":
        return "bg-green-100 text-green-700 border-green-200"
      case "SAVINGS":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "CREDIT_CARD":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-purple-100 text-purple-700 border-purple-200"
    }
  }

  const addAccount = async () => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAccount)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh accounts list
        fetchAccounts()
        setNewAccount({
          name: "",
          type: "BANK",
          balance: 0,
          currency: "LKR",
          description: ""
        })
        setShowAddForm(false)
      } else {
        console.error('Failed to add account:', data.error)
      }
    } catch (error) {
      console.error('Error adding account:', error)
    }
  }

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setNewAccount({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      description: account.description || ""
    })
    setShowEditForm(true)
  }

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return
    
    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAccount)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh accounts list
        fetchAccounts()
        setSelectedAccount(null)
        setNewAccount({
          name: "",
          type: "BANK",
          balance: 0,
          currency: "LKR",
          description: ""
        })
        setShowEditForm(false)
      } else {
        console.error('Failed to update account:', data.error)
      }
    } catch (error) {
      console.error('Error updating account:', error)
    }
  }

  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account)
    setShowDeleteModal(true)
  }

  const confirmDeleteAccount = async () => {
    if (!selectedAccount) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh accounts list
        fetchAccounts()
        setSelectedAccount(null)
        setShowDeleteModal(false)
      } else {
        console.error('Failed to delete account:', data.error)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setIsDeleting(false)
    }
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
                {formatCurrency(totalBalance, "LKR")}
              </div>
              <p className="text-xs text-green-600">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(totalDebt, "LKR")}
              </div>
              <p className="text-xs text-red-600">
                -2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(netWorth, "LKR")}
              </div>
              <p className="text-xs text-blue-600">
                +8.7% from last month
              </p>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteAccount(account)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      <span className={`text-xl font-bold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {showBalances 
                          ? formatCurrency(account.balance, account.currency || "LKR")
                          : "•••••"
                        }
                      </span>
                    </div>
                    {account.description && (
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Account Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Checking"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Account</SelectItem>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newAccount.currency}
                  onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR (Rs.)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Account description..."
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addAccount}>
                  Add Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Main Checking"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Account</SelectItem>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-balance">Current Balance</Label>
                <Input
                  id="edit-balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select
                  value={newAccount.currency}
                  onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR (Rs.)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Account description..."
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAccount}>
                  Update Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteAccount}
          title="Delete Account"
          description={`Are you sure you want to delete the account "${selectedAccount?.name}"? This action cannot be undone and will remove all associated transactions.`}
          itemName={selectedAccount?.name}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  )
}
