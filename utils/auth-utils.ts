// Authentication utility functions for CivicSense admin

export const clearAuthState = () => {
  try {
    // Clear all admin-related localStorage items
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_session')
    
    // Clear any other auth-related items
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('admin') || key.includes('auth') || key.includes('token'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log('Authentication state cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing auth state:', error)
    return false
  }
}

export const refreshPage = () => {
  try {
    window.location.reload()
  } catch (error) {
    console.error('Error refreshing page:', error)
  }
}

export const forceLogout = () => {
  clearAuthState()
  // Redirect to login or home page
  window.location.href = '/admin'
}

// Helper to check if we're in browser environment
export const isBrowser = () => typeof window !== 'undefined'

// Helper to safely access localStorage
export const getStorageItem = (key: string): string | null => {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return null
  }
}

export const setStorageItem = (key: string, value: string): boolean => {
  if (!isBrowser()) return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
    return false
  }
}