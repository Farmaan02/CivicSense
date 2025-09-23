import { describe, it, expect, jest } from '@jest/globals'
import { useToastWrapper } from '@/components/ui/toast-wrapper'

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('ToastWrapper', () => {
  it('should provide toast functions', () => {
    const { 
      showToast, 
      showErrorToast, 
      showSuccessToast, 
      showWarningToast 
    } = useToastWrapper()
    
    expect(typeof showToast).toBe('function')
    expect(typeof showErrorToast).toBe('function')
    expect(typeof showSuccessToast).toBe('function')
    expect(typeof showWarningToast).toBe('function')
  })
})