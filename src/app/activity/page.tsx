"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"
import {
  Activity as ActivityIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings
} from "lucide-react"

interface ActivityItem {
  id: string
  type: "transaction" | "transfer" | "bill_payment" | "goal_update" | "account_update" | "budget_alert"
  title: string
  description: string
  amount?: number
  account?: string
  category?: string
  status: "completed" | "pending" | "failed" | "scheduled"
  timestamp: Date
  metadata?: Record<string, any>
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, filter, searchQuery])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/activities?limit=50')
      const data = await response.json()
      
      if (response.ok) {
        // Convert the timestamps to Date objects
        const activitiesWithDates = data.activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
        setActivities(activitiesWithDates)
      } else {
        console.error('Failed to fetch activities:', data.error)
        setActivities([])
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // Filter by type
    if (filter !== "all") {
      filtered = filtered.filter(activity => activity.type === filter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.account?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredActivities(filtered)
  }

  const getActivityIcon = (type: string, amount?: number) => {
    switch (type) {
      case "transaction":
        return amount && amount > 0 ? (
          <ArrowUpRight className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowDownLeft className="h-5 w-5 text-red-600" />
        )
      case "transfer":
        return <RefreshCw className="h-5 w-5 text-blue-600" />
      case "bill_payment":
        return <CreditCard className="h-5 w-5 text-purple-600" />
      case "goal_update":
        return <Target className="h-5 w-5 text-indigo-600" />
      case "account_update":
        return <Settings className="h-5 w-5 text-gray-600" />
      case "budget_alert":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default:
        return <ActivityIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatAmount = (amount?: number) => {
    if (!amount) return null
    const isPositive = amount > 0
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
    return (
      <span className={isPositive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
        {isPositive ? '+' : '-'}{formatted}
      </span>
    )
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    return "Just now"
  }

  const activityTypeStats = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const completedCount = activities.filter(a => a.status === "completed").length
  const pendingCount = activities.filter(a => a.status === "pending" || a.status === "scheduled").length
  const failedCount = activities.filter(a => a.status === "failed").length

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
            <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
            <p className="text-muted-foreground">
              Track all your financial activities and account changes
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchActivities} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-4"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <ActivityIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{activities.length}</div>
              <p className="text-xs text-blue-600">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{completedCount}</div>
              <p className="text-xs text-green-600">Successful actions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
              <p className="text-xs text-yellow-600">Awaiting execution</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{failedCount}</div>
              <p className="text-xs text-red-600">Require attention</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="transaction">Transactions</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="bill_payment">Bill Payments</SelectItem>
              <SelectItem value="goal_update">Goal Updates</SelectItem>
              <SelectItem value="account_update">Account Updates</SelectItem>
              <SelectItem value="budget_alert">Budget Alerts</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Activity Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Showing {filteredActivities.length} of {activities.length} activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity, index) => (
                    <motion.tr
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getActivityIcon(activity.type, activity.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">{activity.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {activity.account || '-'}
                          {activity.category && (
                            <div className="text-xs text-muted-foreground">{activity.category}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatAmount(activity.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(activity.status)}
                            <span className="capitalize">{activity.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getTimeAgo(activity.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <ActivityIcon className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No activities found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filter !== "all"
                      ? "Try adjusting your search criteria or filters."
                      : "Your financial activities will appear here as you use the app."
                    }
                  </p>
                  {(searchQuery || filter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
