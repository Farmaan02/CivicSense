"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { api } from "@/utils/api"

interface Admin {
  id: string
  username: string
  email?: string
  role: string
  permissions: string[]
  profile?: {
    firstName?: string
    lastName?: string
    position?: string
  }
}

interface AdminAuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  loginAsGuest: (password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Enhanced token validation with timestamp checking
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error parsing token:', error)
    return true // Treat invalid tokens as expired
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (token) {
      // Check if token is expired before verification
      if (isTokenExpired(token)) {
        console.log('Token expired, removing token')
        localStorage.removeItem("admin_token")
        api.setAuthToken(null)
        setLoading(false)
        return
      }
      verifyToken(token)
    } else {
      setLoading(false) // No token, stop loading
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      setLoading(true)
      // Check if token is expired before verification
      if (isTokenExpired(token)) {
        throw new Error('Token expired')
      }
      
      const response = await api.verifyAdminToken(token)
      if (response.valid) {
        setAdmin(response.admin)
        setIsAuthenticated(true)
        api.setAuthToken(token)
      } else {
        console.log('Token verification failed, removing token')
        localStorage.removeItem("admin_token")
        api.setAuthToken(null)
        setAdmin(null)
        setIsAuthenticated(false)
      }
    } catch (error: any) {
      console.error("Token verification failed:", error)
      // Clear invalid tokens
      localStorage.removeItem("admin_token")
      api.setAuthToken(null)
      setAdmin(null)
      setIsAuthenticated(false)
      
      // Set user-friendly error message
      if (error.message && (error.message.includes('401') || error.message.includes('expired'))) {
        setError('Session expired. Please login again.')
      } else {
        setError('Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.adminLogin(username, password)

      localStorage.setItem("admin_token", response.token)
      api.setAuthToken(response.token)
      setAdmin(response.admin)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('Admin login error:', error)
      const errorMessage = error.message || "Login failed"
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginAsGuest = async (password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.adminGuestLogin(password)

      localStorage.setItem("admin_token", response.token)
      api.setAuthToken(response.token)
      setAdmin(response.admin)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('Guest login error:', error)
      const errorMessage = error.message || "Guest login failed"
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("admin_token")
    api.setAuthToken(null)
    setAdmin(null)
    setIsAuthenticated(false)
    setError(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        error,
        login,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
