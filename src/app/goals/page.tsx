"use client"

import { formatCurrency } from "@/lib/currency"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import { motion } from "framer-motion"
import {
  Plus,
  Target,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  AlertTriangle,
  Wallet
} from "lucide-react"
import { format } from "date-fns"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline?: Date
  description?: string
  progress: number
  isCompleted: boolean
  accountId?: string
  account?: {
    id: string
    name: string
    type: string
    balance: number
    currency: string
  }
}

interface GoalsAccount {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalsAccount, setGoalsAccount] = useState<GoalsAccount | null>(null)
  const [hasGoalsAccount, setHasGoalsAccount] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddFundsForm, setShowAddFundsForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNoAccountAlert, setShowNoAccountAlert] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [addFundsAmount, setAddFundsAmount] = useState(0)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    currency: "LKR",
    deadline: undefined as Date | undefined,
    description: ""
  })

  useEffect(() => {
    checkGoalsAccount()
  }, [])

  const checkGoalsAccount = async () => {
    try {
      const response = await fetch('/api/goals/account')
      const data = await response.json()
      
      if (response.ok) {
        if (data.hasGoalsAccount) {
          setHasGoalsAccount(true)
          setGoalsAccount(data.goalsAccount)
          fetchGoals()
        } else {
          setHasGoalsAccount(false)
          setShowNoAccountAlert(true)
        }
      } else {
        console.error('Failed to check goals account:', data.error)
        setHasGoalsAccount(false)
        setShowNoAccountAlert(true)
      }
    } catch (error) {
      console.error('Error checking goals account:', error)
      setHasGoalsAccount(false)
      setShowNoAccountAlert(true)
    }
  }

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()
      
      if (response.ok) {
        const goalsWithProgress = data.goals.map((goal: any) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
          const isCompleted = progress >= 100
          
          return {
            ...goal,
            deadline: goal.deadline ? new Date(goal.deadline) : undefined,
            progress,
            isCompleted
          }
        })
        setGoals(goalsWithProgress)
      } else {
        console.error('Failed to fetch goals:', data.error)
        setGoals([])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      setGoals([])
    }
  }

  const handleAddGoal = async () => {
    try {
      const goalData = {
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        currentAmount: newGoal.currentAmount,
        currency: newGoal.currency,
        deadline: newGoal.deadline ? newGoal.deadline.toISOString() : null,
        accountId: goalsAccount?.id
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      })

      const data = await response.json()

      if (response.ok) {
        fetchGoals()
        setNewGoal({
          name: "",
          targetAmount: 0,
          currentAmount: 0,
          currency: "LKR",
          deadline: undefined,
          description: ""
        })
        setShowAddForm(false)
      } else {
        console.error('Failed to add goal:', data.error)
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      currency: goal.currency,
      deadline: goal.deadline,
      description: goal.description || ""
    })
    setShowEditForm(true)
  }

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return
    
    try {
      const goalData = {
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        currentAmount: newGoal.currentAmount,
        currency: newGoal.currency,
        deadline: newGoal.deadline ? newGoal.deadline.toISOString() : null
      }

      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData)
      })

      if (response.ok) {
        fetchGoals()
        setSelectedGoal(null)
        setNewGoal({
          name: "",
          targetAmount: 0,
          currentAmount: 0,
          currency: "LKR",
          deadline: undefined,
          description: ""
        })
        setShowEditForm(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to update goal:', errorData.error)
        alert('Failed to update goal. Please try again.')
      }
    } catch (error) {
      console.error("Error updating goal:", error)
      alert('Failed to update goal. Please try again.')
    }
  }

  const handleDeleteGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowDeleteModal(true)
  }

  const confirmDeleteGoal = async () => {
    if (!selectedGoal) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchGoals()
        setShowDeleteModal(false)
        setSelectedGoal(null)
      } else {
        console.error('Failed to delete goal')
        alert('Failed to delete goal. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddFunds = async () => {
    if (!selectedGoal || addFundsAmount <= 0) return

    try {
      const newCurrentAmount = selectedGoal.currentAmount + addFundsAmount
      const goalData = {
        name: selectedGoal.name,
        targetAmount: selectedGoal.targetAmount,
        currentAmount: newCurrentAmount,
        currency: selectedGoal.currency,
        deadline: selectedGoal.deadline ? selectedGoal.deadline.toISOString() : null
      }

      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData)
      })

      if (response.ok) {
        fetchGoals()
        setShowAddFundsForm(false)
        setSelectedGoal(null)
        setAddFundsAmount(0)
      } else {
        const errorData = await response.json()
        console.error('Failed to add funds:', errorData.error)
        alert('Failed to add funds. Please try again.')
      }
    } catch (error) {
      console.error('Error adding funds:', error)
      alert('Failed to add funds. Please try again.')
    }
  }

  const getDaysUntilDeadline = (deadline?: Date) => {
    if (!deadline) return null
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const completedGoals = goals.filter(goal => goal.isCompleted).length
  const activeGoals = goals.filter(goal => !goal.isCompleted).length
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  const sortedGoals = [...goals].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
    return b.progress - a.progress
  })

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* No Goals Account Alert */}
        {showNoAccountAlert && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-3">
                <div>
                  <strong>No Goals Account Configured</strong>
                  <p className="text-sm mt-1">
                    You need to set up a Goals Account before you can manage your financial goals. 
                    This account will be used for all goal-related transactions and tracking.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/settings'}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Go to Settings
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
            <p className="text-muted-foreground">
              Set, track, and achieve your financial objectives
            </p>
          </div>
          {hasGoalsAccount && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          )}
        </motion.div>

        {/* Goals Account & Available Balance Cards */}
        {hasGoalsAccount && goalsAccount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-green-800">
                    Goals Account Balance
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    {goalsAccount.name} ({goalsAccount.type})
                  </CardDescription>
                </div>
                <Wallet className="h-8 w-8 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">
                  {formatCurrency(goalsAccount.balance, goalsAccount.currency)}
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Total account balance
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-cyan-800">
                    Available for Goals
                  </CardTitle>
                  <CardDescription className="text-cyan-600">
                    Remaining after allocations
                  </CardDescription>
                </div>
                <DollarSign className="h-8 w-8 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-800">
                  {formatCurrency(goalsAccount.balance - totalCurrentAmount, goalsAccount.currency)}
                </div>
                <p className="text-sm text-cyan-600 mt-1">
                  Balance - Total Saved
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Summary Cards */}
        {hasGoalsAccount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 md:grid-cols-4"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(totalTargetAmount, "LKR")}
                </div>
                <p className="text-xs text-blue-600">Across all goals</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(totalCurrentAmount, "LKR")}
                </div>
                <p className="text-xs text-green-600">{overallProgress.toFixed(1)}% of target</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{activeGoals}</div>
                <p className="text-xs text-purple-600">In progress</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{completedGoals}</div>
                <p className="text-xs text-orange-600">
                  {goals.length > 0 ? ((completedGoals / goals.length) * 100).toFixed(0) : 0}% success rate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Overall Progress */}
        {hasGoalsAccount && goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Combined progress across all your financial goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(totalCurrentAmount, "LKR")} / {formatCurrency(totalTargetAmount, "LKR")}
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    You're {overallProgress.toFixed(1)}% of the way to achieving all your goals!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goals Grid */}
        {hasGoalsAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {sortedGoals.length === 0 ? (
              <Card className="col-span-full border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start your financial journey by creating your first goal.
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sortedGoals.map((goal, index) => {
                const daysUntilDeadline = getDaysUntilDeadline(goal.deadline)
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
                      goal.isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-white'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className={`text-lg ${
                              goal.isCompleted ? 'text-green-800' : 'text-gray-900'
                            }`}>
                              {goal.name}
                              {goal.isCompleted && (
                                <CheckCircle className="inline-block ml-2 h-5 w-5 text-green-600" />
                              )}
                            </CardTitle>
                            {goal.description && (
                              <CardDescription className="mt-1">
                                {goal.description}
                              </CardDescription>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Goal
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedGoal(goal)
                                  setShowAddFundsForm(true)
                                }}
                                disabled={goal.isCompleted}
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Add Funds
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteGoal(goal)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Goal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                            </span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {goal.progress.toFixed(1)}% complete
                          </p>
                        </div>

                        {/* Deadline */}
                        {goal.deadline && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {daysUntilDeadline !== null ? (
                                daysUntilDeadline > 0 ? (
                                  `${daysUntilDeadline} days remaining`
                                ) : daysUntilDeadline === 0 ? (
                                  <span className="text-orange-600 font-medium">Due today</span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    {Math.abs(daysUntilDeadline)} days overdue
                                  </span>
                                )
                              ) : (
                                format(goal.deadline, "MMM dd, yyyy")
                              )}
                            </span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={goal.isCompleted ? "default" : "secondary"}
                            className={goal.isCompleted ? "bg-green-600" : ""}
                          >
                            {goal.isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                          {goal.account && (
                            <Badge variant="outline" className="text-xs">
                              {goal.account.name}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}

        {/* Add Goal Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    value={newGoal.targetAmount || ""}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-amount">Current Amount</Label>
                  <Input
                    id="current-amount"
                    type="number"
                    value={newGoal.currentAmount || ""}
                    onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Goals Account</Label>
                <Input
                  value={goalsAccount ? `${goalsAccount.name} (${goalsAccount.type})` : "No account configured"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Goals will be managed using your configured goals account
                </p>
              </div>

              <div className="space-y-2">
                <Label>Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.deadline ? format(newGoal.deadline, "PPP") : "Select deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.deadline}
                      onSelect={(date) => setNewGoal({...newGoal, deadline: date})}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Description (Optional)</Label>
                <Textarea
                  id="goal-description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Add details about your goal..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGoal} disabled={!newGoal.name || !newGoal.targetAmount}>
                  Add Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Goal Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goal-name">Goal Name</Label>
                <Input
                  id="edit-goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target-amount">Target Amount</Label>
                  <Input
                    id="edit-target-amount"
                    type="number"
                    value={newGoal.targetAmount || ""}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-current-amount">Current Amount</Label>
                  <Input
                    id="edit-current-amount"
                    type="number"
                    value={newGoal.currentAmount || ""}
                    onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Goals Account</Label>
                <Input
                  value={goalsAccount ? `${goalsAccount.name} (${goalsAccount.type})` : "No account configured"}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.deadline ? format(newGoal.deadline, "PPP") : "Select deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.deadline}
                      onSelect={(date) => setNewGoal({...newGoal, deadline: date})}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-goal-description">Description (Optional)</Label>
                <Textarea
                  id="edit-goal-description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Add details about your goal..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateGoal} disabled={!newGoal.name || !newGoal.targetAmount}>
                  Update Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Funds Dialog */}
        <Dialog open={showAddFundsForm} onOpenChange={setShowAddFundsForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Funds to Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Goal</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedGoal?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current: {formatCurrency(selectedGoal?.currentAmount || 0, selectedGoal?.currency || "LKR")} / 
                    Target: {formatCurrency(selectedGoal?.targetAmount || 0, selectedGoal?.currency || "LKR")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-funds-amount">Amount to Add</Label>
                <Input
                  id="add-funds-amount"
                  type="number"
                  value={addFundsAmount || ""}
                  onChange={(e) => setAddFundsAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddFundsForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFunds} disabled={addFundsAmount <= 0}>
                  Add Funds
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteGoal}
          title="Delete Goal"
          description={`Are you sure you want to delete "${selectedGoal?.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  )
}
