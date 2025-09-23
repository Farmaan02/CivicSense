import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { ApiClient } from '@/utils/api'

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ApiClient constructor', () => {
    it('should create an instance with default base URL', () => {
      const client = new ApiClient()
      expect(client).toBeInstanceOf(ApiClient)
    })

    it('should create an instance with custom base URL', () => {
      const customUrl = 'http://custom-api.com'
      const client = new ApiClient(customUrl)
      expect(client).toBeInstanceOf(ApiClient)
    })
  })

  describe('setAuthToken', () => {
    it('should set the auth token', () => {
      const client = new ApiClient()
      const token = 'test-token'
      client.setAuthToken(token)
      // We can't directly access the private authToken property, but we can test
      // that the getAuthHeaders method returns the correct headers
      const headers = (client as any).getAuthHeaders()
      expect(headers.Authorization).toBe(`Bearer ${token}`)
    })

    it('should clear the auth token when null is passed', () => {
      const client = new ApiClient()
      client.setAuthToken('test-token')
      client.setAuthToken(null)
      const headers = (client as any).getAuthHeaders()
      expect(headers.Authorization).toBeUndefined()
    })
  })

  describe('getAuthHeaders', () => {
    it('should return default headers without auth token', () => {
      const client = new ApiClient()
      const headers = (client as any).getAuthHeaders()
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers.Authorization).toBeUndefined()
    })

    it('should return headers with auth token when set', () => {
      const client = new ApiClient()
      const token = 'test-token'
      client.setAuthToken(token)
      const headers = (client as any).getAuthHeaders()
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers.Authorization).toBe(`Bearer ${token}`)
    })
  })
})