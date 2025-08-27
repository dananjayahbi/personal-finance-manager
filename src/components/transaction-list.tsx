"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import TransactionForm from "./transaction-form"
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react"
import { format } from "date-fns"

interface TransactionListProps {
  onTransactionUpdate?: () => void
}

export default function TransactionList({ onTransactionUpdate }: TransactionListProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    categoryId: ""
  })

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.categoryId) params.append("categoryId", filters.categoryId)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`/api/transactions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleTransactionSubmit = () => {
    setShowForm(false)
    setEditingTransaction(null)
    fetchTransactions()
    onTransactionUpdate?.()
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        fetchTransactions()
        onTransactionUpdate?.()
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Your complete transaction history</CardDescription>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <TransactionForm
                onSubmit={handleTransactionSubmit}
                onCancel={() => setShowForm(false)}
                categories={categories}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.type || "all"} onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value })}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.categoryId || "all"} onValueChange={(value) => setFilters({ ...filters, categoryId: value === "all" ? "" : value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <span>{transaction.category.icon}</span>
                        <span>{transaction.category.name}</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Uncategorized</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "INCOME" ? "default" : "secondary"}>
                      {transaction.type === "INCOME" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "INCOME" ? "+" : "-"}{Math.abs(transaction.amount).toFixed(2)} {transaction.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Transaction</DialogTitle>
                          </DialogHeader>
                          <TransactionForm
                            onSubmit={handleTransactionSubmit}
                            onCancel={() => setEditingTransaction(null)}
                            initialData={editingTransaction}
                            categories={categories}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Add your first transaction to get started!
          </div>
        )}
      </CardContent>
    </Card>
  )
}