import mongoose from 'mongoose'

// Global variables to store the connection state
// This prevents multiple connections in development mode
let cached = {
  conn: null,
  promise: null
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

async function connectToDatabase(mongoUri) {
  // Initialize cached object if it doesn't exist
  if (!cached) {
    cached = { conn: null, promise: null }
  }

  if (cached.conn) {
    console.log('[MongoDB] Using existing connection')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      // Add connection retry options
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      // SSL/TLS options for better compatibility
      tls: true,
      tlsInsecure: false,
      // Connection retry options
      retryWrites: true,
      retryReads: true,
    }

    console.log('[MongoDB] Creating new connection')
    console.log('[MongoDB] Node.js version:', process.version)
    
    // Check Node.js version compatibility
    if (!process.version.startsWith('v20.')) {
      console.warn('[MongoDB] Warning: This project is designed for Node.js v20.x for optimal MongoDB compatibility')
    }

    cached.promise = mongoose.connect(mongoUri || MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('[MongoDB] Connection established successfully')
      return mongooseInstance.connection
    }).catch((error) => {
      console.error('[MongoDB] Connection failed:', error.message)
      
      // Provide specific guidance based on error type
      if (error.message.includes('tlsv1 alert internal error')) {
        console.error('[MongoDB] SSL/TLS compatibility issue detected.')
        console.error('[MongoDB] This is commonly caused by Node.js version incompatibility.')
        console.error('[MongoDB] Please use Node.js v20.x for MongoDB Atlas compatibility.')
      }
      
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
    console.log('[MongoDB] Connection ready')
    // Setup connection listeners
    setupConnectionListeners(cached.conn)
  } catch (e) {
    console.error('[MongoDB] Connection error:', e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Add connection event listeners for better observability
function setupConnectionListeners(connection) {
  connection.on('connected', () => {
    console.log('[MongoDB] Database connected')
  })

  connection.on('error', (err) => {
    console.error('[MongoDB] Database connection error:', err)
    
    // Provide specific guidance for common errors
    if (err.message && err.message.includes('AuthenticationFailed')) {
      console.error('[MongoDB] Authentication failed. Please check your MongoDB credentials.')
      console.error('[MongoDB] Ensure your MONGODB_URI in .env.local has correct username/password.')
    }
  })

  connection.on('disconnected', () => {
    console.log('[MongoDB] Database disconnected')
  })

  connection.on('reconnected', () => {
    console.log('[MongoDB] Database reconnected')
  })

  connection.on('close', () => {
    console.log('[MongoDB] Database connection closed')
  })
}

// Export the connection function
export default connectToDatabase

// Export a function to get the connection status
export function getConnectionStatus() {
  if (!cached) return 'not-initialized'
  if (cached.conn) return 'connected'
  if (cached.promise) return 'connecting'
  return 'disconnected'
}

// Export a function to close the connection
export async function closeConnection() {
  if (cached && cached.conn) {
    await mongoose.connection.close()
    cached = null
    console.log('[MongoDB] Connection closed manually')
  }
}