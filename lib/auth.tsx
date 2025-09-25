"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/utils/api"

export interface User {
  id: string
  email: string
  name: string
  role: "citizen" | "admin" | "moderator"
  avatar?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
  guestLogin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session - only run on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("civiccare_user")
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (e) {
          console.error("Failed to parse stored user", e)
          localStorage.removeItem("civiccare_user")
          localStorage.removeItem("auth_token")
        }
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.login(email, password)
      setUser(response.user)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("civiccare_user", JSON.stringify(response.user))
      }
    } catch (error) {
      throw new Error("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const response = await api.signup(email, password, name)
      setUser(response.user)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("civiccare_user", JSON.stringify(response.user))
      }
    } catch (error: any) {
      throw new Error(error.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const guestLogin = async () => {
    setLoading(true)
    try {
      const response = await api.guestLogin()
      const guestUser: User = {
        id: "guest",
        email: "",
        name: response.user.name,
        role: "citizen",
        createdAt: new Date().toISOString()
      }
      setUser(guestUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("civiccare_user", JSON.stringify(guestUser))
      }
    } catch (error: any) {
      throw new Error(error.message || "Guest login failed")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("civiccare_user")
      localStorage.removeItem("auth_token")
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading, guestLogin }}>{children}</AuthContext.Provider>
}