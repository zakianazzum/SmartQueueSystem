"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, signIn, signUp, getUserById } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const checkStoredUser = async () => {
      const storedUser = localStorage.getItem("smartqueue_user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          // Validate the stored user with the API
          const validUser = await getUserById(parsedUser.userId)
          if (validUser) {
            // Preserve the visitor ID from stored data
            const userData = {
              ...validUser,
              visitorId: parsedUser.visitorId
            }
            setUser(userData)
          } else {
            // Remove invalid stored user
            localStorage.removeItem("smartqueue_user")
          }
        } catch (error) {
          console.error("Error validating stored user:", error)
          localStorage.removeItem("smartqueue_user")
        }
      }
      setLoading(false)
    }

    checkStoredUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const loginResult = await signIn(email, password)
      if (loginResult) {
        setUser(loginResult.user)
        // Store user data and visitor ID in localStorage
        const userData = {
          ...loginResult.user,
          visitorId: loginResult.visitorId
        }
        localStorage.setItem("smartqueue_user", JSON.stringify(userData))
        return true
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const userData = await signUp(name, email, password)
      if (userData) {
        setUser(userData)
        localStorage.setItem("smartqueue_user", JSON.stringify(userData))
        return true
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("smartqueue_user")
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
