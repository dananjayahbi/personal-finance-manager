"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  PiggyBank,
  Car,
  Home,
  Plane
} from "lucide-react"
import { format } from "date-fns"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline?: Date
  description: string
  category: string
  progress: number
  monthlyTarget?: number
  isCompleted: boolean
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    currency: "USD",
    deadline: undefined as Date | undefined,
    description: "",
    category: "Other"
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    // Mock data for demonstration
    const mockGoals: Goal[] = [
      {
        id: "1",
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 8500,
        currency: "USD",
        deadline: new Date(2025, 11, 31),
        description: "Build a 6-month emergency fund for financial security",
        category: "Emergency",
        progress: 85,
        monthlyTarget: 500,
        isCompleted: false
      },
      {
        id: "2",
        name: "Vacation to Europe",
        targetAmount: 5000,
        currentAmount: 2100,
        currency: "USD",
        deadline: new Date(2026, 5, 15),
        description: "Two-week trip to Europe including flights, hotels, and activities",
        category: "Travel",
        progress: 42,
        monthlyTarget: 300,
        isCompleted: false
      },
      {
        id: "3",
        name: "New Car Down Payment",
        targetAmount: 15000,
        currentAmount: 12000,
        currency: "USD",
        deadline: new Date(2025, 9, 30),
        description: "Down payment for a reliable used car",
        category: "Transportation",
        progress: 80,
        monthlyTarget: 1000,
        isCompleted: false
      },
      {
        id: "4",
        name: "Home Down Payment",
        targetAmount: 60000,
        currentAmount: 15000,
        currency: "USD",
        deadline: new Date(2027, 3, 1),
        description: "20% down payment for first home purchase",
        category: "Housing",
        progress: 25,
        monthlyTarget: 1500,
        isCompleted: false
      },
      {
        id: "5",
        name: "MacBook Pro",
        targetAmount: 2500,
        currentAmount: 2500,
        currency: "USD",
        deadline: new Date(2025, 6, 1),
        description: "New laptop for work and personal projects",
        category: "Technology",
        progress: 100,
        isCompleted: true
      }
    ]
    setGoals(mockGoals)
  }

  const handleAddGoal = async () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      progress: newGoal.targetAmount > 0 ? (newGoal.currentAmount / newGoal.targetAmount) * 100 : 0,
      isCompleted: false
    }
    setGoals([...goals, goal])
    setNewGoal({
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      currency: "USD",
      deadline: undefined,
      description: "",
      category: "Other"
    })
    setShowAddForm(false)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Emergency":
        return <PiggyBank className="h-5 w-5" />
      case "Travel":
        return <Plane className="h-5 w-5" />
      case "Transportation":
        return <Car className="h-5 w-5" />
      case "Housing":
        return <Home className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Emergency":
        return "bg-red-100 text-red-800 border-red-200"
      case "Travel":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Transportation":
        return "bg-green-100 text-green-800 border-green-200"
      case "Housing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Technology":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    if (progress >= 25) return "bg-orange-500"
    return "bg-red-500"
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
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
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
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                ${totalTargetAmount.toLocaleString()}
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
                ${totalCurrentAmount.toLocaleString()}
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

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                    ${totalCurrentAmount.toLocaleString()} / ${totalTargetAmount.toLocaleString()}
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

        {/* Goals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {sortedGoals.map((goal, index) => {
            const daysUntilDeadline = getDaysUntilDeadline(goal.deadline)
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${
                  goal.isCompleted ? 'ring-2 ring-green-200 bg-green-50/50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                          {getCategoryIcon(goal.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <Badge variant="outline" className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                        </div>
                      </div>
                      {goal.isCompleted && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        className={`h-2 ${getProgressColor(goal.progress)}`}
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>${goal.currentAmount.toLocaleString()}</span>
                        <span>${goal.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}

                    {goal.deadline && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Due: {format(goal.deadline, "MMM dd, yyyy")}
                        </span>
                        {daysUntilDeadline !== null && (
                          <Badge variant={daysUntilDeadline < 30 ? "destructive" : "secondary"}>
                            {daysUntilDeadline > 0 
                              ? `${daysUntilDeadline} days left`
                              : daysUntilDeadline === 0
                                ? "Due today"
                                : `${Math.abs(daysUntilDeadline)} days overdue`
                            }
                          </Badge>
                        )}
                      </div>
                    )}

                    {goal.monthlyTarget && !goal.isCompleted && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">Monthly Target</div>
                        <div className="text-lg font-bold text-blue-700">
                          ${goal.monthlyTarget.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">
                          ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <DollarSign className="mr-1 h-3 w-3" />
                        Add Funds
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Add Goal Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target-amount">Target Amount</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    step="0.01"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                    placeholder="10000.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="current-amount">Current Amount</Label>
                  <Input
                    id="current-amount"
                    type="number"
                    step="0.01"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Emergency">Emergency Fund</option>
                  <option value="Travel">Travel</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Housing">Housing</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.deadline ? format(newGoal.deadline, "PPP") : "Select deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.deadline}
                      onSelect={(date) => setNewGoal({...newGoal, deadline: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe your goal and why it's important to you..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddGoal} 
                disabled={!newGoal.name || newGoal.targetAmount <= 0}
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
