"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  phone?: string
  preferredCurrency: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, currency: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app load
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Try to fetch user data from the API
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("finance-app-user", JSON.stringify(data.user))
      } else {
        // If API fails, check localStorage for saved user
        const savedUser = localStorage.getItem("finance-app-user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } else {
          // If nothing works, create demo user
          const demoUser = {
            id: "user-1",
            email: "demo@example.com",
            name: "Demo User",
            firstName: "",
            lastName: "",
            phone: "",
            preferredCurrency: "LKR",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setUser(demoUser)
          localStorage.setItem("finance-app-user", JSON.stringify(demoUser))
        }
      }
    } catch (error) {
      console.error("Auth status check failed:", error)
      // Fallback to demo user
      const demoUser = {
        id: "user-1",
        email: "demo@example.com",
        name: "Demo User",
        firstName: "",
        lastName: "",
        phone: "",
        preferredCurrency: "LKR",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(demoUser)
      localStorage.setItem("finance-app-user", JSON.stringify(demoUser))
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("finance-app-user", JSON.stringify(data.user))
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem("finance-app-user", JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string, currency: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, currency })
      })

      const data = await response.json()

      if (response.ok) {
        // Don't automatically log in after signup
        // Just return success, user should log in manually
        return true
      }
      return false
    } catch (error) {
      console.error("Signup failed:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("finance-app-user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}