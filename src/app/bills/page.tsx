"use client"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import { motion } from "framer-motion"
import {
  Plus,
  CreditCard,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  CalendarDays,
  TrendingUp
} from "lucide-react"
import { format } from "date-fns"

interface Bill {
  id: string
  name: string
  amount: number
  currency: string
  dueDate: Date
  frequency: string
  category: string
  isPaid: boolean
  isRecurring: boolean
  description?: string
  daysUntilDue: number
  account?: string
  accountId?: string
  transactionId?: string
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingBill, setIsAddingBill] = useState(false)
  const [isUpdatingBill, setIsUpdatingBill] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    currency: "LKR",
    dueDate: new Date(),
    frequency: "MONTHLY",
    category: "",
    description: "",
    isRecurring: true,
    account: ""
  })

  useEffect(() => {
    fetchBills()
    fetchAccounts()
    fetchCategories()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills')
      const data = await response.json()
      
      if (response.ok) {
        // Calculate days until due for each bill
        const billsWithDaysCalculated = data.bills.map((bill: any) => {
          const today = new Date()
          const dueDate = new Date(bill.dueDate)
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          return {
            ...bill,
            dueDate,
            daysUntilDue,
            category: bill.category?.name || "",
            account: bill.account?.name || ""
          }
        })
        setBills(billsWithDaysCalculated)
      } else {
        console.error('Failed to fetch bills:', data.error)
        // Fall back to mock data if needed
        setBills([])
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
      setBills([])
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'x-user-id': 'user-1'
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
      } else {
        console.error('Failed to fetch categories:', data.error)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleAddBill = async () => {
    setIsAddingBill(true)
    try {
      const billData = {
        name: newBill.name,
        amount: parseFloat(newBill.amount) || 0,
        currency: newBill.currency,
        dueDate: newBill.dueDate.toISOString(),
        frequency: newBill.frequency,
        categoryId: null, // For now, we'll set this to null
        accountId: newBill.account && newBill.account.trim() !== "" ? newBill.account : null,
        description: newBill.description,
        isRecurring: newBill.isRecurring
      }

      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-1'
        },
        body: JSON.stringify(billData)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh bills list
        fetchBills()
        setNewBill({
          name: "",
          amount: "",
          currency: "LKR",
          dueDate: new Date(),
          frequency: "MONTHLY",
          category: "",
          description: "",
          isRecurring: true,
          account: ""
        })
        setShowAddForm(false)
      } else {
        console.error('Failed to add bill:', data.error)
        alert('Failed to add bill. Please try again.')
      }
    } catch (error) {
      console.error('Error adding bill:', error)
      alert('Failed to add bill. Please try again.')
    } finally {
      setIsAddingBill(false)
    }
  }

  const toggleBillPaid = async (billId: string) => {
    try {
      const bill = bills.find(b => b.id === billId)
      if (!bill) return

      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-1'
        },
        body: JSON.stringify({
          isPaid: !bill.isPaid
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update the bill in the local state
        setBills(bills.map(b => 
          b.id === billId ? { ...b, isPaid: !b.isPaid } : b
        ))
      } else {
        console.error('Failed to update bill:', data.error)
      }
    } catch (error) {
      console.error('Error updating bill:', error)
    }
  }

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill)
    setNewBill({
      name: bill.name,
      amount: bill.amount.toString(),
      currency: bill.currency,
      dueDate: bill.dueDate,
      frequency: bill.frequency,
      category: bill.category,
      description: bill.description || "",
      isRecurring: bill.isRecurring,
      account: bill.accountId || ""
    })
    setShowEditForm(true)
  }

  const handleUpdateBill = async () => {
    if (!selectedBill) return
    
    setIsUpdatingBill(true)
    try {
      const billData = {
        name: newBill.name,
        amount: parseFloat(newBill.amount) || 0,
        currency: newBill.currency,
        dueDate: newBill.dueDate.toISOString(),
        frequency: newBill.frequency,
        accountId: newBill.account && newBill.account.trim() !== "" ? newBill.account : null,
        description: newBill.description,
        isRecurring: newBill.isRecurring
      }

      const response = await fetch(`/api/bills/${selectedBill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-1'
        },
        body: JSON.stringify(billData)
      })

      if (response.ok) {
        // Refresh bills list
        fetchBills()
        setSelectedBill(null)
        setNewBill({
          name: "",
          amount: "",
          currency: "LKR",
          dueDate: new Date(),
          frequency: "MONTHLY",
          category: "",
          description: "",
          isRecurring: true,
          account: ""
        })
        setShowEditForm(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to update bill:', errorData.error)
        alert('Failed to update bill. Please try again.')
      }
    } catch (error) {
      console.error("Error updating bill:", error)
      alert('Failed to update bill. Please try again.')
    } finally {
      setIsUpdatingBill(false)
    }
  }

  const handleDeleteBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowDeleteModal(true)
  }

  const confirmDeleteBill = async () => {
    if (!selectedBill) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/bills/${selectedBill.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': 'user-1'
        }
      })

      if (response.ok) {
        // Refresh bills list
        fetchBills()
        setSelectedBill(null)
        setShowDeleteModal(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to delete bill:', errorData.error)
        alert('Failed to delete bill. Please try again.')
      }
    } catch (error) {
      console.error("Failed to delete bill:", error)
      alert('Failed to delete bill. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getBillStatus = (bill: Bill) => {
    if (bill.isPaid) return "paid"
    if (bill.daysUntilDue < 0) return "overdue"
    if (bill.daysUntilDue <= 3) return "due-soon"
    return "upcoming"
  }

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "due-soon":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getBillStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <XCircle className="h-4 w-4" />
      case "due-soon":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalMonthlyBills = bills
    .filter(bill => bill.frequency === "MONTHLY")
    .reduce((sum, bill) => sum + bill.amount, 0)

  const overdueBills = bills.filter(bill => !bill.isPaid && bill.daysUntilDue < 0)
  const upcomingBills = bills.filter(bill => !bill.isPaid && bill.daysUntilDue >= 0 && bill.daysUntilDue <= 7)
  const paidThisMonth = bills.filter(bill => bill.isPaid).length

  const sortedBills = [...bills].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1
    return a.daysUntilDue - b.daysUntilDue
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
            <h1 className="text-3xl font-bold tracking-tight">Bills & Payments</h1>
            <p className="text-muted-foreground">
              Track recurring bills and never miss a payment deadline
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
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
              <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                ${totalMonthlyBills.toFixed(2)}
              </div>
              <p className="text-xs text-blue-600">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{overdueBills.length}</div>
              <p className="text-xs text-red-600">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <CalendarDays className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{upcomingBills.length}</div>
              <p className="text-xs text-orange-600">Next 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{paidThisMonth}</div>
              <p className="text-xs text-green-600">
                {((paidThisMonth / bills.length) * 100).toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bills List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {sortedBills.map((bill, index) => {
            const status = getBillStatus(bill)
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${
                  bill.isPaid ? 'opacity-75' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={bill.isPaid}
                          onCheckedChange={() => toggleBillPaid(bill.id)}
                          className="h-5 w-5"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${bill.isPaid ? 'line-through text-muted-foreground' : ''}`}>
                              {bill.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              {bill.category && (
                                <Badge variant="outline" className="text-xs">
                                  {bill.category}
                                </Badge>
                              )}
                              {bill.isRecurring && (
                                <Badge variant="secondary" className="text-xs">
                                  {bill.frequency}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${bill.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {format(bill.dueDate, "MMM dd, yyyy")}
                          </div>
                        </div>

                        <Badge 
                          variant="outline" 
                          className={`${getBillStatusColor(status)} flex items-center space-x-1`}
                        >
                          {getBillStatusIcon(status)}
                          <span className="capitalize">
                            {status === "due-soon" ? "Due Soon" : status}
                          </span>
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBill(bill)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBill(bill)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {bill.description && (
                      <div className="mt-3 ml-9">
                        <p className="text-sm text-muted-foreground">{bill.description}</p>
                      </div>
                    )}

                    {!bill.isPaid && Math.abs(bill.daysUntilDue) <= 3 && (
                      <div className="mt-3 ml-9">
                        <div className={`text-sm font-medium ${
                          bill.daysUntilDue < 0 
                            ? 'text-red-600' 
                            : bill.daysUntilDue <= 3 
                              ? 'text-orange-600' 
                              : 'text-blue-600'
                        }`}>
                          {bill.daysUntilDue < 0 
                            ? `${Math.abs(bill.daysUntilDue)} day(s) overdue`
                            : bill.daysUntilDue === 0
                              ? "Due today"
                              : `Due in ${bill.daysUntilDue} day(s)`
                          }
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Add Bill Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bill-name">Bill Name</Label>
                <Input
                  id="bill-name"
                  value={newBill.name}
                  onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                  placeholder="e.g., Electric Bill"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={newBill.currency}
                    onValueChange={(value) => setNewBill({...newBill, currency: value})}
                  >
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={newBill.account}
                  onValueChange={(value) => setNewBill({...newBill, account: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency} {account.balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newBill.dueDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newBill.dueDate}
                      onSelect={(date) => date && setNewBill({...newBill, dueDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newBill.frequency}
                    onValueChange={(value) => setNewBill({...newBill, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newBill.category}
                    onValueChange={(value) => setNewBill({...newBill, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Default categories */}
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                      <SelectItem value="Loan Payments">Loan Payments</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      {/* Database categories */}
                      {categories.filter(category => 
                        !['Utilities', 'Rent', 'Insurance', 'Internet', 'Phone', 'Subscriptions', 'Loan Payments', 'Credit Card', 'Other'].includes(category.name)
                      ).map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newBill.description}
                  onChange={(e) => setNewBill({...newBill, description: e.target.value})}
                  placeholder="Add notes about this bill..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={newBill.isRecurring}
                  onCheckedChange={(checked) => 
                    setNewBill({...newBill, isRecurring: checked as boolean})
                  }
                />
                <Label htmlFor="recurring">This is a recurring bill</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={isAddingBill}>
                Cancel
              </Button>
              <Button onClick={handleAddBill} disabled={isAddingBill || !newBill.name || !newBill.amount || parseFloat(newBill.amount) <= 0}>
                {isAddingBill ? "Adding..." : "Add Bill"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Bill Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Bill</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-bill-name">Bill Name</Label>
                <Input
                  id="edit-bill-name"
                  value={newBill.name}
                  onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                  placeholder="e.g., Electric Bill"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select
                    value={newBill.currency}
                    onValueChange={(value) => setNewBill({...newBill, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-account">Account</Label>
                <Select
                  value={newBill.account}
                  onValueChange={(value) => setNewBill({...newBill, account: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency} {account.balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newBill.dueDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newBill.dueDate}
                      onSelect={(date) => date && setNewBill({...newBill, dueDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-frequency">Frequency</Label>
                  <Select
                    value={newBill.frequency}
                    onValueChange={(value) => setNewBill({...newBill, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={newBill.category}
                    onValueChange={(value) => setNewBill({...newBill, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Default categories */}
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                      <SelectItem value="Loan Payments">Loan Payments</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      {/* Database categories */}
                      {categories.filter(category => 
                        !['Utilities', 'Rent', 'Insurance', 'Internet', 'Phone', 'Subscriptions', 'Loan Payments', 'Credit Card', 'Other'].includes(category.name)
                      ).map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={newBill.description}
                  onChange={(e) => setNewBill({...newBill, description: e.target.value})}
                  placeholder="Add notes about this bill..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-recurring"
                  checked={newBill.isRecurring}
                  onCheckedChange={(checked) => 
                    setNewBill({...newBill, isRecurring: checked as boolean})
                  }
                />
                <Label htmlFor="edit-recurring">This is a recurring bill</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditForm(false)} disabled={isUpdatingBill}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBill} disabled={isUpdatingBill || !newBill.name || !newBill.amount || parseFloat(newBill.amount) <= 0}>
                {isUpdatingBill ? "Updating..." : "Update Bill"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteBill}
          title="Delete Bill"
          description={`Are you sure you want to delete "${selectedBill?.name}"? This action cannot be undone and will remove all payment history.`}
          itemName={selectedBill?.name}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  )
}
