import { describe, it, expect } from '@jest/globals'
import { 
  emailSchema, 
  passwordSchema, 
  nameSchema, 
  phoneSchema,
  reportSchema,
  loginSchema,
  registerSchema,
  userProfileSchema
} from '@/lib/form-validation'

describe('Form Validation', () => {
  describe('emailSchema', () => {
    it('should validate a correct email', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject an invalid email', () => {
      const result = emailSchema.safeParse('invalid-email')
      expect(result.success).toBe(false)
    })

    it('should reject an empty email', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('should validate a password with minimum length', () => {
      const result = passwordSchema.safeParse('password123')
      expect(result.success).toBe(true)
    })

    it('should reject a password that is too short', () => {
      const result = passwordSchema.safeParse('pass')
      expect(result.success).toBe(false)
    })

    it('should reject an empty password', () => {
      const result = passwordSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should reject a password that is too long', () => {
      const result = passwordSchema.safeParse('a'.repeat(129))
      expect(result.success).toBe(false)
    })
  })

  describe('nameSchema', () => {
      it('should validate a correct name', () => {
        const result = nameSchema.safeParse('John Doe')
        expect(result.success).toBe(true)
      })

      it('should reject an empty name', () => {
        const result = nameSchema.safeParse('')
        expect(result.success).toBe(false)
      })

      it('should reject a name that is too long', () => {
        const result = nameSchema.safeParse('a'.repeat(101))
        expect(result.success).toBe(false)
      })
    })

  describe('phoneSchema', () => {
    it('should validate a correct phone number', () => {
      const result = phoneSchema.safeParse('+1234567890')
      expect(result.success).toBe(true)
    })

    it('should reject a phone number that is too short', () => {
      const result = phoneSchema.safeParse('123')
      expect(result.success).toBe(false)
    })

    it('should reject a phone number with invalid characters', () => {
      const result = phoneSchema.safeParse('123-456-7890')
      expect(result.success).toBe(false)
    })

    it('should validate phone number with plus sign', () => {
      const result = phoneSchema.safeParse('+12345678901234') // 14 digits
      expect(result.success).toBe(true)
    })

    it('should reject phone number that is too long', () => {
      const result = phoneSchema.safeParse('+1234567890123456') // 16 digits
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('should reject login data with missing email', () => {
      const result = loginSchema.safeParse({
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject login data with missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('should reject registration data with mismatched passwords', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject registration data with missing fields', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com'
        // Missing password and confirmPassword
      })
      expect(result.success).toBe(false)
    })
  })

  describe('userProfileSchema', () => {
    it('should validate correct user profile data', () => {
      const result = userProfileSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        phone: '+1234567890',
        bio: 'This is a test bio'
      })
      expect(result.success).toBe(true)
    })

    it('should validate user profile data without optional fields', () => {
      const result = userProfileSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com'
      })
      expect(result.success).toBe(true)
    })

    it('should reject user profile data with invalid email', () => {
      const result = userProfileSchema.safeParse({
        name: 'John Doe',
        email: 'invalid-email'
      })
      expect(result.success).toBe(false)
    })

    it('should reject user profile data with too long bio', () => {
      const result = userProfileSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        bio: 'a'.repeat(501)
      })
      expect(result.success).toBe(false)
    })
  })

  describe('reportSchema', () => {
    const validReportData = {
      title: 'Broken streetlight',
      description: 'The streetlight at the corner of Main St and Oak Ave is broken and needs repair.',
      category: 'Infrastructure',
      location: {
        lat: 40.7128,
        lng: -74.0060
      },
      address: '123 Main St, New York, NY 10001',
      priority: 'medium' as const,
      anonymous: false
    }

    it('should validate correct report data', () => {
      const result = reportSchema.safeParse(validReportData)
      expect(result.success).toBe(true)
    })

    it('should reject report data with short title', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        title: 'Bad'
      })
      expect(result.success).toBe(false)
    })

    it('should reject report data with missing category', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        category: ''
      })
      expect(result.success).toBe(false)
    })

    it('should reject report data with short description', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        description: 'Too short'
      })
      expect(result.success).toBe(false)
    })

    it('should reject report data with long title', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        title: 'a'.repeat(101)
      })
      expect(result.success).toBe(false)
    })

    it('should reject report data with long description', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        description: 'a'.repeat(1001)
      })
      expect(result.success).toBe(false)
    })

    it('should validate report data with location having out of range coordinates (validation happens in backend)', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        location: {
          lat: 100, // Out of range but still a number
          lng: -200 // Out of range but still a number
        }
      })
      // The Zod schema only validates that lat/lng are numbers, not their ranges
      expect(result.success).toBe(true)
    })

    it('should reject report data with location having non-numeric values', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        location: {
          lat: "invalid" as any, // Invalid type
          lng: -74.0060
        }
      })
      expect(result.success).toBe(false)
    })

    it('should validate report data without location', () => {
      const result = reportSchema.safeParse({
        ...validReportData,
        location: undefined
      })
      expect(result.success).toBe(true)
    })
  })
})