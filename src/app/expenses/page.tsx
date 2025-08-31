"use client"

import { useState, useEffect, useMemo } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2
} from "lucide-react"

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  account: string
  recurring: boolean
  tags: string[]
  notes?: string
  currency: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    account: "",
    currency: "LKR",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  })

  useEffect(() => {
    fetchExpenses()
    fetchAccounts()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/transactions?type=EXPENSE')
      const data = await response.json()
      
      if (response.ok) {
        // Convert API transactions to expenses format
        const convertedExpenses: Expense[] = data.transactions.map((tx: any) => ({
          id: tx.id,
          date: new Date(tx.date).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          description: tx.description || "Expense",
          category: tx.category?.name || "Other",
          amount: tx.amount,
          account: tx.fromAccount?.name || "Unknown",
          recurring: tx.recurring || false,
          tags: [], // Default empty tags since it's not in the database model
          currency: tx.currency || "LKR",
          notes: tx.notes || ""
        }))
        setExpenses(convertedExpenses)
      } else {
        console.error('Failed to fetch expenses:', data.error)
        // Fall back to empty array if needed
        setExpenses([])
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setExpenses([])
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      
      if (response.ok) {
        setAccounts(data.accounts)
      } else {
        console.error('Failed to fetch accounts:', data.error)
        setAccounts([])
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setAccounts([])
    }
  }

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(expenses.map(expense => expense.category)))
    return ["all", ...uniqueCategories]
  }, [expenses])

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "category":
          aValue = a.category
          bValue = b.category
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [expenses, searchTerm, selectedCategory, sortBy, sortOrder])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, expense) => sum + expense.amount, 0)

  const handleSort = (column: "date" | "amount" | "category") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      account: expense.account,
      date: expense.date,
      notes: expense.notes || "",
      currency: expense.currency || "LKR"
    })
    setShowEditForm(true)
  }

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDeleteModal(true)
  }

  const confirmDeleteExpense = async () => {
    if (!selectedExpense) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transactions/${selectedExpense.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Refresh both expenses list and account balances
        fetchExpenses()
        fetchAccounts()
        setSelectedExpense(null)
        setShowDeleteModal(false)
      } else {
        console.error("Failed to delete expense:", await response.text())
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category || !newExpense.account) {
      alert("Please fill in all required fields")
      return
    }

    setIsAddingExpense(true)
    try {
      // Find the account ID based on selected account name
      const selectedAccount = accounts.find(acc => acc.name === newExpense.account)
      if (!selectedAccount) {
        alert("Please select a valid account")
        setIsAddingExpense(false)
        return
      }

      const expenseData = {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        type: "EXPENSE",
        currency: newExpense.currency,
        date: new Date(newExpense.date).toISOString(),
        categoryId: "expense-category-1", // Default category for now
        fromAccountId: selectedAccount.id, // For expenses, money comes from an account
        recurring: false
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      })

      if (response.ok) {
        // Refresh expenses list and account balances
        fetchExpenses()
        fetchAccounts()
        setNewExpense({
          description: "",
          amount: "",
          category: "",
          account: "",
          date: new Date().toISOString().split('T')[0],
          notes: "",
          currency: "LKR"
        })
        setShowAddForm(false)
      } else {
        const errorData = await response.json()
        console.error("Failed to add expense:", errorData)
        alert("Failed to add expense. Please try again.")
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      alert("Failed to add expense. Please try again.")
    } finally {
      setIsAddingExpense(false)
    }
  }

  const handleUpdateExpense = async () => {
    if (!selectedExpense || !newExpense.description || !newExpense.amount || !newExpense.category || !newExpense.account) {
      alert("Please fill in all required fields")
      return
    }

    setIsUpdatingExpense(true)
    try {
      // Find the account ID based on selected account name
      const selectedAccount = accounts.find(acc => acc.name === newExpense.account)
      if (!selectedAccount) {
        alert("Please select a valid account")
        setIsUpdatingExpense(false)
        return
      }

      const expenseData = {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        type: "EXPENSE",
        currency: newExpense.currency,
        date: new Date(newExpense.date).toISOString(),
        categoryId: "expense-category-1", // Default category for now
        fromAccountId: selectedAccount.id, // For expenses, money comes from an account
        recurring: false
      }

      const response = await fetch(`/api/transactions/${selectedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      })

      if (response.ok) {
        // Refresh expenses list and account balances
        fetchExpenses()
        fetchAccounts()
        setNewExpense({
          description: "",
          amount: "",
          category: "",
          account: "",
          date: new Date().toISOString().split('T')[0],
          notes: "",
          currency: "LKR"
        })
        setSelectedExpense(null)
        setShowEditForm(false)
      } else {
        const errorData = await response.json()
        console.error("Failed to update expense:", errorData)
        alert("Failed to update expense. Please try again.")
      }
    } catch (error) {
      console.error("Error updating expense:", error)
      alert("Failed to update expense. Please try again.")
    } finally {
      setIsUpdatingExpense(false)
    }
  }

  const exportExpenses = () => {
    const csvContent = [
      // CSV Header
      'Date,Description,Category,Amount,Account,Notes',
      // CSV Data
      ...filteredAndSortedExpenses.map(expense => [
        expense.date,
        `"${expense.description}"`,
        `"${expense.category}"`,
        expense.amount,
        `"${expense.account}"`,
        `"${expense.notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Food & Dining": "bg-orange-100 text-orange-800 border-orange-200",
      "Transportation": "bg-blue-100 text-blue-800 border-blue-200",
      "Entertainment": "bg-purple-100 text-purple-800 border-purple-200",
      "Bills & Utilities": "bg-red-100 text-red-800 border-red-200",
      "Shopping": "bg-green-100 text-green-800 border-green-200",
      "Health & Fitness": "bg-pink-100 text-pink-800 border-pink-200"
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your spending with detailed analytics
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportExpenses}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
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
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +3.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${thisMonthExpenses.toFixed(2)}</div>
              <p className="text-xs text-red-600">
                <TrendingUp className="inline mr-1 h-3 w-3" />
                +8.1% vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageExpense.toFixed(2)}</div>
              <p className="text-xs text-green-600">
                <TrendingDown className="inline mr-1 h-3 w-3" />
                -2.5% improvement
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredAndSortedExpenses.length} filtered
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Expense Management</CardTitle>
              <CardDescription>Filter and search through your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses, categories, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Category: {selectedCategory === "all" ? "All" : selectedCategory}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map(category => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === "all" ? "All Categories" : category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Advanced Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortBy === "date" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center">
                          Category
                          {sortBy === "category" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center justify-end">
                          Amount
                          {sortBy === "amount" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedExpenses.map((expense, index) => (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{expense.description}</span>
                            {expense.recurring && (
                              <Badge variant="secondary" className="w-fit mt-1">
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-red-600">
                          -${expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{expense.account}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {expense.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteExpense(expense)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAndSortedExpenses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No expenses found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Expense Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="e.g., Grocery Shopping"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={newExpense.currency} onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select value={newExpense.account} onValueChange={(value) => setNewExpense({ ...newExpense, account: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.name}>
                          {account.name} ({account.currency} {account.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes (optional)"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={isAddingExpense}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense} disabled={isAddingExpense}>
                  {isAddingExpense ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Expense Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Input
                  id="edit-description"
                  placeholder="e.g., Grocery Shopping"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Currency *</Label>
                  <Select value={newExpense.currency} onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-account">Account</Label>
                  <Select value={newExpense.account} onValueChange={(value) => setNewExpense({ ...newExpense, account: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.name}>
                          {account.name} ({account.currency} {account.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Additional notes (optional)"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowEditForm(false)
                  setSelectedExpense(null)
                  setNewExpense({
                    description: "",
                    amount: "",
                    category: "",
                    account: "",
                    date: new Date().toISOString().split('T')[0],
                    notes: "",
                    currency: "LKR"
                  })
                }} disabled={isUpdatingExpense}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateExpense} disabled={isUpdatingExpense}>
                  {isUpdatingExpense ? "Updating..." : "Update Expense"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteExpense}
          title="Delete Expense"
          description={`Are you sure you want to delete the expense "${selectedExpense?.description}"? This action cannot be undone.`}
          itemName={selectedExpense?.description}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  )
}
