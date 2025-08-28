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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [newBill, setNewBill] = useState({
    name: "",
    amount: 0,
    currency: "USD",
    dueDate: new Date(),
    frequency: "MONTHLY",
    category: "",
    description: "",
    isRecurring: true
  })

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    // Mock data for demonstration
    const today = new Date()
    const mockBills: Bill[] = [
      {
        id: "1",
        name: "Rent Payment",
        amount: 1200.00,
        currency: "USD",
        dueDate: new Date(today.getFullYear(), today.getMonth(), 1),
        frequency: "MONTHLY",
        category: "Housing",
        isPaid: true,
        isRecurring: true,
        description: "Monthly apartment rent",
        daysUntilDue: -27
      },
      {
        id: "2",
        name: "Electric Bill",
        amount: 89.20,
        currency: "USD",
        dueDate: new Date(today.getFullYear(), today.getMonth(), 15),
        frequency: "MONTHLY",
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        description: "Monthly electricity bill",
        daysUntilDue: -13
      },
      {
        id: "3",
        name: "Internet Service",
        amount: 65.99,
        currency: "USD",
        dueDate: new Date(today.getFullYear(), today.getMonth(), 20),
        frequency: "MONTHLY",
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        description: "High-speed internet",
        daysUntilDue: -8
      },
      {
        id: "4",
        name: "Car Insurance",
        amount: 145.50,
        currency: "USD",
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        frequency: "MONTHLY",
        category: "Insurance",
        isPaid: false,
        isRecurring: true,
        description: "Auto insurance premium",
        daysUntilDue: 8
      },
      {
        id: "5",
        name: "Netflix Subscription",
        amount: 15.99,
        currency: "USD",
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 12),
        frequency: "MONTHLY",
        category: "Entertainment",
        isPaid: false,
        isRecurring: true,
        description: "Streaming service",
        daysUntilDue: 15
      },
      {
        id: "6",
        name: "Gym Membership",
        amount: 45.00,
        currency: "USD",
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 18),
        frequency: "MONTHLY",
        category: "Health & Fitness",
        isPaid: false,
        isRecurring: true,
        description: "Monthly gym membership",
        daysUntilDue: 21
      }
    ]
    setBills(mockBills)
  }

  const handleAddBill = async () => {
    const bill: Bill = {
      id: Date.now().toString(),
      ...newBill,
      isPaid: false,
      daysUntilDue: Math.ceil((newBill.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }
    setBills([...bills, bill])
    setNewBill({
      name: "",
      amount: 0,
      currency: "USD",
      dueDate: new Date(),
      frequency: "MONTHLY",
      category: "",
      description: "",
      isRecurring: true
    })
    setShowAddForm(false)
  }

  const toggleBillPaid = (billId: string) => {
    setBills(bills.map(bill => 
      bill.id === billId ? { ...bill, isPaid: !bill.isPaid } : bill
    ))
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
                              <Badge variant="outline" className="text-xs">
                                {bill.category}
                              </Badge>
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

                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
                    onChange={(e) => setNewBill({...newBill, amount: parseFloat(e.target.value) || 0})}
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
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Input
                    id="category"
                    value={newBill.category}
                    onChange={(e) => setNewBill({...newBill, category: e.target.value})}
                    placeholder="e.g., Utilities"
                  />
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
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBill} disabled={!newBill.name || newBill.amount <= 0}>
                Add Bill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
