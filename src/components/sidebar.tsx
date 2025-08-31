"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useCounts } from "@/hooks/use-counts"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  Target,
  TrendingUp,
  Settings,
  Bell,
  ArrowLeftRight,
  Wallet,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Calendar,
  PieChart
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { counts, loading } = useCounts()
  
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "Accounts",
      href: "/accounts",
      icon: Wallet,
      badge: null,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
      badge: counts && counts.scheduledTransactionsCount > 0 ? counts.scheduledTransactionsCount.toString() : null,
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: Receipt,
      badge: null,
    },
    {
      title: "Balances",
      href: "/balances",
      icon: PieChart,
      badge: null,
    },
    {
      title: "Bills",
      href: "/bills",
      icon: CreditCard,
      badge: counts && counts.billsCount > 0 ? counts.billsCount.toString() : null,
    },
    {
      title: "Goals",
      href: "/goals",
      icon: Target,
      badge: null,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: counts && counts.notificationsCount > 0 ? counts.notificationsCount.toString() : null,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ]
  const pathname = usePathname()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <motion.div
      className={cn(
        "flex h-screen flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        collapsed ? "w-16" : "w-64",
        className
      )}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinanceHub
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto"
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className={cn(
            "h-8 w-8 p-0 ml-auto",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="user-expanded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Personal Account
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="user-collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto"
            >
              <User className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10",
                      collapsed && "justify-center",
                      isActive && "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 text-left"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  )
}
