"use client"

import { useState, useEffect, useMemo } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    // Mock data for demonstration
    const mockExpenses: Expense[] = [
      {
        id: "1",
        date: "2025-08-28",
        description: "Grocery shopping at Whole Foods",
        category: "Food & Dining",
        amount: 125.50,
        account: "Main Checking",
        recurring: false,
        tags: ["groceries", "weekly"]
      },
      {
        id: "2",
        date: "2025-08-27",
        description: "Netflix subscription",
        category: "Entertainment",
        amount: 15.99,
        account: "Credit Card",
        recurring: true,
        tags: ["streaming", "monthly"]
      },
      {
        id: "3",
        date: "2025-08-26",
        description: "Gas station fill-up",
        category: "Transportation",
        amount: 68.75,
        account: "Main Checking",
        recurring: false,
        tags: ["fuel", "car"]
      },
      {
        id: "4",
        date: "2025-08-25",
        description: "Coffee shop meeting",
        category: "Food & Dining",
        amount: 12.50,
        account: "Cash Wallet",
        recurring: false,
        tags: ["coffee", "business"]
      },
      {
        id: "5",
        date: "2025-08-24",
        description: "Electric bill payment",
        category: "Bills & Utilities",
        amount: 89.20,
        account: "Main Checking",
        recurring: true,
        tags: ["utilities", "monthly"]
      },
      {
        id: "6",
        date: "2025-08-23",
        description: "Amazon online shopping",
        category: "Shopping",
        amount: 156.99,
        account: "Credit Card",
        recurring: false,
        tags: ["online", "household"]
      },
      {
        id: "7",
        date: "2025-08-22",
        description: "Gym membership",
        category: "Health & Fitness",
        amount: 45.00,
        account: "Main Checking",
        recurring: true,
        tags: ["fitness", "monthly"]
      },
      {
        id: "8",
        date: "2025-08-21",
        description: "Restaurant dinner",
        category: "Food & Dining",
        amount: 78.90,
        account: "Credit Card",
        recurring: false,
        tags: ["dining", "weekend"]
      }
    ]
    setExpenses(mockExpenses)
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
    // For now, just log - could open an edit dialog
    console.log("Edit expense:", expense)
    // TODO: Implement edit expense functionality
  }

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDeleteModal(true)
  }

  const confirmDeleteExpense = async () => {
    if (!selectedExpense) return
    
    setIsDeleting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setExpenses(expenses.filter(expense => expense.id !== selectedExpense.id))
      setSelectedExpense(null)
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setIsDeleting(false)
    }
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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
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
