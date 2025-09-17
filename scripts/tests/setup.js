import { jest, beforeAll, afterAll, afterEach } from "@jest/globals"

// Mock environment variables for testing
process.env.NODE_ENV = "test"
process.env.PORT = "3001"

// Global test setup
beforeAll(() => {
  console.log("[v0] Starting test suite...")
})

afterAll(() => {
  console.log("[v0] Test suite completed.")
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
