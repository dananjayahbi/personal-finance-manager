"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  Bell,
  BellRing,
  Check,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  Target,
  CreditCard,
  Trash2,
  Mail,
  Filter,
  Settings
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "BILL_DUE" | "SCHEDULED_TRANSACTION" | "GOAL_DEADLINE" | "BUDGET_EXCEEDED" | "LOW_BALANCE" | "GENERAL"
  isRead: boolean
  actionUrl?: string
  createdAt: Date
  priority: "high" | "medium" | "low"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    // Mock data for demonstration
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "Electric Bill Due Tomorrow",
        message: "Your electric bill of $89.20 is due tomorrow (Aug 29). Don't forget to pay it on time to avoid late fees.",
        type: "BILL_DUE",
        isRead: false,
        actionUrl: "/bills",
        createdAt: new Date(2025, 7, 28, 9, 0),
        priority: "high"
      },
      {
        id: "2",
        title: "Scheduled Transfer Overdue",
        message: "Your scheduled transfer of $500 to Savings Account was supposed to happen yesterday. Please review and execute manually.",
        type: "SCHEDULED_TRANSACTION",
        isRead: false,
        actionUrl: "/transactions",
        createdAt: new Date(2025, 7, 28, 8, 30),
        priority: "high"
      },
      {
        id: "3",
        title: "Goal Deadline Approaching",
        message: "Your 'New Car Down Payment' goal deadline is in 32 days. You're 80% complete with $3,000 remaining.",
        type: "GOAL_DEADLINE",
        isRead: false,
        actionUrl: "/goals",
        createdAt: new Date(2025, 7, 28, 7, 15),
        priority: "medium"
      },
      {
        id: "4",
        title: "Low Balance Alert",
        message: "Your Main Checking account balance is below $500. Current balance: $420.50. Consider transferring funds.",
        type: "LOW_BALANCE",
        isRead: false,
        actionUrl: "/accounts",
        createdAt: new Date(2025, 7, 27, 14, 45),
        priority: "high"
      },
      {
        id: "5",
        title: "Monthly Budget Exceeded",
        message: "You've exceeded your Food & Dining budget by $45.30 this month. Current spending: $345.30 vs budget: $300.",
        type: "BUDGET_EXCEEDED",
        isRead: true,
        actionUrl: "/expenses",
        createdAt: new Date(2025, 7, 27, 11, 20),
        priority: "medium"
      },
      {
        id: "6",
        title: "Emergency Fund Goal Achieved!",
        message: "Congratulations! You've successfully saved $10,000 for your Emergency Fund goal. Time to set a new goal!",
        type: "GENERAL",
        isRead: true,
        actionUrl: "/goals",
        createdAt: new Date(2025, 7, 26, 16, 0),
        priority: "low"
      },
      {
        id: "7",
        title: "Car Insurance Payment Due",
        message: "Your car insurance premium of $145.50 is due in 5 days (Sep 2). Auto-pay is not enabled for this bill.",
        type: "BILL_DUE",
        isRead: true,
        actionUrl: "/bills",
        createdAt: new Date(2025, 7, 26, 9, 30),
        priority: "medium"
      },
      {
        id: "8",
        title: "Weekly Spending Summary",
        message: "You spent $280.50 this week across 12 transactions. This is 15% less than last week. Great job!",
        type: "GENERAL",
        isRead: true,
        createdAt: new Date(2025, 7, 25, 18, 0),
        priority: "low"
      }
    ]
    setNotifications(mockNotifications)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "BILL_DUE":
        return <CreditCard className="h-5 w-5 text-red-600" />
      case "SCHEDULED_TRANSACTION":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "GOAL_DEADLINE":
        return <Target className="h-5 w-5 text-purple-600" />
      case "BUDGET_EXCEEDED":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "LOW_BALANCE":
        return <DollarSign className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-gray-50 border-gray-200"
    
    switch (type) {
      case "BILL_DUE":
      case "LOW_BALANCE":
        return "bg-red-50 border-red-200"
      case "SCHEDULED_TRANSACTION":
        return "bg-blue-50 border-blue-200"
      case "GOAL_DEADLINE":
        return "bg-purple-50 border-purple-200"
      case "BUDGET_EXCEEDED":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ))
  }

  const markAsUnread = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: false }
        : notification
    ))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })))
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.isRead
      case "high":
        return notification.priority === "high"
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const highPriorityCount = notifications.filter(n => n.priority === "high" && !n.isRead).length

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
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your financial activities and important reminders
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
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
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{notifications.length}</div>
              <p className="text-xs text-blue-600">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <BellRing className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{unreadCount}</div>
              <p className="text-xs text-orange-600">Require attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{highPriorityCount}</div>
              <p className="text-xs text-red-600">Urgent actions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {notifications.length > 0 ? ((notifications.filter(n => n.isRead).length / notifications.length) * 100).toFixed(0) : 0}%
              </div>
              <p className="text-xs text-green-600">Notifications read</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2"
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "high" ? "default" : "outline"}
            onClick={() => setFilter("high")}
          >
            High Priority ({highPriorityCount})
          </Button>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <Card 
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                  getNotificationBgColor(notification.type, notification.isRead)
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          )}
                          <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className={`text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'} mb-2`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                              View Details →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {notification.isRead ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsUnread(notification.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Bell className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === "all" 
                ? "You're all caught up! No notifications to display."
                : filter === "unread"
                  ? "No unread notifications. You're all caught up!"
                  : "No high priority notifications at the moment."
              }
            </p>
            {filter !== "all" && (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Notifications
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
