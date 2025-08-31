"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useNotificationContext } from "@/contexts/notification-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  Settings,
  Eye,
  MailOpen,
  MailCheck,
  RefreshCw,
  Clock
} from "lucide-react"

interface RelatedItem {
  id: string
  name?: string
  description?: string
  amount: number
  currency: string
  dueDate?: string
  scheduledDate?: string
  isPaid?: boolean
  isExecuted?: boolean
  type?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: "BILL_DUE" | "SCHEDULED_TRANSACTION" | "GOAL_DEADLINE" | "BUDGET_EXCEEDED" | "LOW_BALANCE" | "GENERAL"
  priority: "HIGH" | "MEDIUM" | "LOW"
  isRead: boolean
  actionUrl?: string
  createdAt: Date
  isOverdue: boolean
  relatedItem: RelatedItem | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "bills" | "transactions" | "overdue">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all")
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { refreshCounts } = useNotificationContext()

  useEffect(() => {
    fetchNotifications()
  }, [filter, priorityFilter])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      
      if (filter === "unread") {
        params.append("isRead", "false")
      } else if (filter === "bills") {
        params.append("category", "bills")
      } else if (filter === "transactions") {
        params.append("category", "transactions")
      }
      
      if (priorityFilter !== "all") {
        params.append("priority", priorityFilter)
      }

      const response = await fetch(`/api/notifications?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        // Convert API response to UI format and filter overdue if needed
        let notificationsWithUiProps = data.notifications.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt)
        }))

        // Apply overdue filter
        if (filter === "overdue") {
          notificationsWithUiProps = notificationsWithUiProps.filter((n: Notification) => n.isOverdue)
        }

        setNotifications(notificationsWithUiProps)
      } else {
        console.error('Failed to fetch notifications:', data.error)
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    }
  }

  const generateNotifications = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/notifications/generate', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        console.log('Notifications generated:', data.result)
        // Refresh the notifications list
        await fetchNotifications()
        // Refresh the sidebar notification count
        refreshCounts()
      } else {
        console.error('Failed to generate notifications:', data.error)
      }
    } catch (error) {
      console.error('Error generating notifications:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getNotificationIcon = (type: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
    
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

  const getNotificationBgColor = (priority: string, isRead: boolean, isOverdue: boolean) => {
    if (isRead) return "bg-gray-50 border-gray-200"
    
    if (isOverdue) return "bg-red-50 border-red-300"
    
    switch (priority) {
      case "HIGH":
        return "bg-red-50 border-red-200"
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-200"
      case "LOW":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isRead: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update the notification in the local state
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        ))
        // Refresh the sidebar notification count
        refreshCounts()
      } else {
        console.error('Failed to mark notification as read:', data.error)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isRead: false
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update the notification in the local state
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        ))
        // Refresh the sidebar notification count
        refreshCounts()
      } else {
        console.error('Failed to mark notification as unread:', data.error)
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(notifications.filter(notification => notification.id !== notificationId))
        setSelectedNotifications(prev => {
          const newSet = new Set(prev)
          newSet.delete(notificationId)
          return newSet
        })
      } else {
        const data = await response.json()
        console.error('Failed to delete notification:', data.error)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      for (const notification of unreadNotifications) {
        await fetch(`/api/notifications/${notification.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isRead: true
          })
        })
      }

      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })))
      // Refresh the sidebar notification count
      refreshCounts()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotifications)
    if (checked) {
      newSelected.add(notificationId)
    } else {
      newSelected.delete(notificationId)
    }
    setSelectedNotifications(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)))
    } else {
      setSelectedNotifications(new Set())
    }
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.size === 0) return

    try {
      for (const notificationId of Array.from(selectedNotifications)) {
        await fetch(`/api/notifications/${notificationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isRead: true
          })
        })
      }

      setNotifications(notifications.map(notification => 
        selectedNotifications.has(notification.id)
          ? { ...notification, isRead: true }
          : notification
      ))
      setSelectedNotifications(new Set())
      // Refresh the sidebar notification count
      refreshCounts()
    } catch (error) {
      console.error('Error bulk marking as read:', error)
    }
  }

  const handleBulkMarkAsUnread = async () => {
    if (selectedNotifications.size === 0) return

    try {
      for (const notificationId of Array.from(selectedNotifications)) {
        await fetch(`/api/notifications/${notificationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isRead: false
          })
        })
      }

      setNotifications(notifications.map(notification => 
        selectedNotifications.has(notification.id)
          ? { ...notification, isRead: false }
          : notification
      ))
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error('Error bulk marking as unread:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotifications.size === 0) return

    try {
      for (const notificationId of Array.from(selectedNotifications)) {
        await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE'
        })
      }

      setNotifications(notifications.filter(notification => 
        !selectedNotifications.has(notification.id)
      ))
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error('Error bulk deleting notifications:', error)
    }
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsViewDialogOpen(true)
  }

  const filteredNotifications = notifications // Filtering is now done in API, so we use all fetched notifications

  const unreadCount = notifications.filter(n => !n.isRead).length
  const highPriorityCount = notifications.filter(n => n.priority === "HIGH" && !n.isRead).length
  const overdueCount = notifications.filter(n => n.isOverdue && !n.isRead).length

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
            <Button 
              onClick={generateNotifications} 
              disabled={isGenerating}
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Notifications
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
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
            variant={filter === "bills" ? "default" : "outline"}
            onClick={() => setFilter("bills")}
          >
            Bills
          </Button>
          <Button
            variant={filter === "transactions" ? "default" : "outline"}
            onClick={() => setFilter("transactions")}
          >
            Transactions
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            onClick={() => setFilter("overdue")}
          >
            Overdue ({overdueCount})
          </Button>
        </motion.div>

        {/* Priority Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 items-center"
        >
          <span className="text-sm font-medium text-gray-700">Priority:</span>
          <Button
            variant={priorityFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("all")}
          >
            All
          </Button>
          <Button
            variant={priorityFilter === "HIGH" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("HIGH")}
          >
            High ({highPriorityCount})
          </Button>
          <Button
            variant={priorityFilter === "MEDIUM" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("MEDIUM")}
          >
            Medium
          </Button>
          <Button
            variant={priorityFilter === "LOW" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("LOW")}
          >
            Low
          </Button>
        </motion.div>

        {/* Bulk Operations */}
        {selectedNotifications.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedNotifications.size} of {filteredNotifications.length} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsRead}
              >
                <MailCheck className="mr-2 h-4 w-4" />
                Mark as Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsUnread}
              >
                <MailOpen className="mr-2 h-4 w-4" />
                Mark as Unread
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Notifications</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedNotifications.size} selected notifications? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        )}

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
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${
                  getNotificationBgColor(notification.priority, notification.isRead, notification.isOverdue)
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Checkbox
                        checked={selectedNotifications.has(notification.id)}
                        onCheckedChange={(checked) => handleSelectNotification(notification.id, checked as boolean)}
                      />
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type, notification.isOverdue)}
                      </div>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
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
                        {/* Related Item Information */}
                        {notification.relatedItem && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-medium">
                                  {notification.relatedItem.name || notification.relatedItem.description}
                                </span>
                                <span className="ml-2 text-gray-500">
                                  {notification.relatedItem.currency} {notification.relatedItem.amount.toFixed(2)}
                                </span>
                              </div>
                              {notification.isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(notification)
                            }}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
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
                          className="opacity-60 hover:opacity-100 transition-opacity"
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this notification? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteNotification(notification.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

        {/* View Details Modal */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {selectedNotification && getNotificationIcon(selectedNotification.type, selectedNotification.isOverdue)}
                <span>Notification Details</span>
              </DialogTitle>
              <DialogDescription>
                Complete information about this notification
              </DialogDescription>
            </DialogHeader>
            
            {selectedNotification && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Notification ID</h4>
                    <p className="text-sm font-mono">{selectedNotification.id}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
                    <p className="text-sm capitalize">{selectedNotification.type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Title</h4>
                  <p className="font-medium">{selectedNotification.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Message</h4>
                  <p className="text-sm">{selectedNotification.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Priority</h4>
                    <Badge variant="outline" className={getPriorityColor(selectedNotification.priority)}>
                      {selectedNotification.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                    <Badge variant="outline" className={selectedNotification.isRead ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
                      {selectedNotification.isRead ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Created</h4>
                  <p className="text-sm">
                    {selectedNotification.createdAt.toLocaleDateString()} at {selectedNotification.createdAt.toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeAgo(selectedNotification.createdAt)}
                  </p>
                </div>

                {selectedNotification.actionUrl && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Action URL</h4>
                    <p className="text-sm text-blue-600 break-all">{selectedNotification.actionUrl}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Settings Modal */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Notification Settings</span>
              </DialogTitle>
              <DialogDescription>
                Configure your notification preferences
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Bill Due Reminders</h4>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming bill payments</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Budget Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get alerted when budgets are exceeded</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Goal Reminders</h4>
                    <p className="text-sm text-muted-foreground">Receive reminders about financial goals</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
