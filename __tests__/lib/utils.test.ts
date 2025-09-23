import { describe, it, expect } from '@jest/globals'
import { formatDate, truncateString, generateId, isValidEmail, cn } from '@/lib/utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format a date string correctly', () => {
      const date = '2023-12-25T10:00:00Z'
      const formatted = formatDate(date)
      expect(formatted).toBe('December 25, 2023')
    })

    it('should handle invalid date strings', () => {
      const date = 'invalid-date'
      expect(() => formatDate(date)).not.toThrow()
    })
  })

  describe('truncateString', () => {
    it('should truncate a string when it exceeds the specified length', () => {
      const str = 'This is a long string that needs to be truncated'
      const truncated = truncateString(str, 20)
      expect(truncated).toBe('This is a long st...')
    })

    it('should not truncate a string when it is shorter than the specified length', () => {
      const str = 'Short string'
      const truncated = truncateString(str, 20)
      expect(truncated).toBe('Short string')
    })

    it('should handle edge cases', () => {
      // Test with exact length
      const str = 'Exactly 10 chars'
      const truncated = truncateString(str, 10)
      expect(truncated).toBe('Exactly...')

      // Test with very short length
      const truncated2 = truncateString(str, 5)
      expect(truncated2).toBe('Ex...')
    })
  })

  describe('generateId', () => {
    it('should generate a random ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
    })

    it('should generate IDs of reasonable length', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(10)
    })
  })

  describe('isValidEmail', () => {
    it('should return true for a valid email', () => {
      const email = 'test@example.com'
      expect(isValidEmail(email)).toBe(true)
    })

    it('should return false for an invalid email', () => {
      const email = 'invalid-email'
      expect(isValidEmail(email)).toBe(false)
    })

    it('should return false for an empty string', () => {
      const email = ''
      expect(isValidEmail(email)).toBe(false)
    })

    it('should handle various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example.co.uk'
      ]
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should handle various invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain.',
        'spaces @domain.com'
      ]
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional class names', () => {
      const result = cn('class1', { 'class2': true, 'class3': false })
      expect(result).toBe('class1 class2')
    })

    it('should handle tailwind merge functionality', () => {
      const result = cn('px-2 py-1 bg-red-500', 'px-3 bg-blue-500')
      // twMerge should take the last conflicting value
      expect(result).toContain('px-3')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('py-1')
    })
  })
})