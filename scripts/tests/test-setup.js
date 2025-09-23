import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

// Set NODE_ENV to test
process.env.NODE_ENV = 'test'

let mongoServer

// Set up MongoDB memory server before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  
  // Disconnect any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}, 15000) // Increase timeout for MongoDB setup

// Clean up after all tests
afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
}, 15000) // Increase timeout for cleanup

// Export the mongoServer for use in individual test files if needed
export { mongoServer }