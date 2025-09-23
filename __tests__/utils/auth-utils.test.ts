import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { 
  clearAuthState, 
  refreshPage, 
  forceLogout, 
  isBrowser, 
  getStorageItem, 
  setStorageItem 
} from '@/utils/auth-utils'

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null
  },
  setItem(key: string, value: string) {
    this.store[key] = value.toString()
  },
  removeItem(key: string) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  },
  get length() {
    return Object.keys(this.store).length
  },
  key(index: number) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

describe('Auth Utils', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    mockLocalStorage.store = {}
    
    // Mock window and localStorage
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('isBrowser', () => {
    it('should return true in browser environment', () => {
      expect(isBrowser()).toBe(true)
    })
  })

  describe('getStorageItem', () => {
    it('should return item from localStorage', () => {
      mockLocalStorage.setItem('testKey', 'testValue')
      expect(getStorageItem('testKey')).toBe('testValue')
    })

    it('should return null for non-existent item', () => {
      expect(getStorageItem('nonExistent')).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(mockLocalStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      
      expect(getStorageItem('test')).toBeNull()
    })
  })

  describe('setStorageItem', () => {
    it('should set item in localStorage', () => {
      expect(setStorageItem('testKey', 'testValue')).toBe(true)
      expect(mockLocalStorage.getItem('testKey')).toBe('testValue')
    })

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(mockLocalStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      
      expect(setStorageItem('test', 'value')).toBe(false)
    })
  })

  describe('clearAuthState', () => {
    it('should remove admin-related items from localStorage', () => {
      // Set up test data
      mockLocalStorage.setItem('admin_token', 'token123')
      mockLocalStorage.setItem('admin_user', 'user123')
      mockLocalStorage.setItem('admin_session', 'session123')
      mockLocalStorage.setItem('regular_item', 'regular123')
      
      expect(clearAuthState()).toBe(true)
      
      // Check that admin items were removed
      expect(mockLocalStorage.getItem('admin_token')).toBeNull()
      expect(mockLocalStorage.getItem('admin_user')).toBeNull()
      expect(mockLocalStorage.getItem('admin_session')).toBeNull()
      
      // Check that regular items were not removed
      expect(mockLocalStorage.getItem('regular_item')).toBe('regular123')
    })

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(mockLocalStorage, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      
      expect(clearAuthState()).toBe(false)
    })
  })
})