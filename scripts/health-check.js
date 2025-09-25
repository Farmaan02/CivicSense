#!/usr/bin/env node

// Health check script for CivicPulse backend
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { MongoClient } from "mongodb"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 CivicPulse Health Check')
console.log('========================')

// Check Node.js version
const nodeVersion = process.version
console.log(`Node.js version: ${nodeVersion}`)
if (!nodeVersion.startsWith('v20.')) {
  console.log('⚠️  Warning: This project is designed to run on Node.js v20.x')
  console.log('   Current version may cause compatibility issues with MongoDB SSL/TLS')
}

// Check environment files
const envPaths = [
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env')
]

let envFileFound = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`✅ Environment file found: ${envPath}`)
    envFileFound = true
    
    // Load and check critical variables
    dotenv.config({ path: envPath })
    break
  }
}

if (!envFileFound) {
  console.log('⚠️  No environment file found')
  dotenv.config() // Try default loading
}

// Check critical environment variables
const criticalVars = ['JWT_SECRET', 'MONGODB_URI']
const missingVars = []

for (const varName of criticalVars) {
  if (!process.env[varName]) {
    missingVars.push(varName)
    console.log(`❌ Missing environment variable: ${varName}`)
  } else {
    console.log(`✅ Environment variable found: ${varName}`)
    if (varName === 'JWT_SECRET') {
      console.log(`   Secret length: ${process.env[varName].length} characters`)
      if (process.env[varName].length < 16) {
        console.log('   ⚠️  WARNING: JWT secret is too short for production use')
      }
    }
    if (varName === 'MONGODB_URI') {
      // Mask the URI for security
      const maskedUri = process.env[varName].replace(/\/\/[^:]*:[^@]*@/, '//***:***@')
      console.log(`   Connection string: ${maskedUri}`)
    }
  }
}

if (missingVars.length > 0) {
  console.log(`\n⚠️  ${missingVars.length} critical environment variables are missing`)
  console.log('Please set these variables in your .env.local file')
  process.exit(1)
} else {
  console.log('\n✅ All critical environment variables are present')
}

// Check required directories
const requiredDirs = ['uploads']
for (const dir of requiredDirs) {
  const dirPath = path.join(__dirname, '..', dir)
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Required directory not found: ${dirPath}`)
    console.log(`   Creating directory...`)
    try {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`   ✅ Directory created successfully`)
    } catch (error) {
      console.log(`   ❌ Failed to create directory: ${error.message}`)
    }
  } else {
    console.log(`✅ Required directory exists: ${dirPath}`)
  }
}

// Test MongoDB connection
async function testMongoDBConnection() {
  console.log('\n🔌 Testing MongoDB connection...')
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not set, skipping database test')
    return false
  }
  
  try {
    // Try connecting with relaxed SSL options for compatibility
    const client = new MongoClient(process.env.MONGODB_URI, {
      tls: true,
      tlsInsecure: false,
      // Add options to handle SSL/TLS compatibility issues
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })
    
    await client.connect()
    console.log('✅ MongoDB connection successful')
    
    // Test basic operations
    const db = client.db()
    await db.command({ ping: 1 })
    console.log('✅ MongoDB ping successful')
    
    await client.close()
    return true
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`)
    
    // Provide specific guidance based on error type
    if (error.message.includes('tlsv1 alert internal error')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:')
      console.log('   This SSL/TLS error is commonly caused by Node.js version incompatibility.')
      console.log('   The project requires Node.js v20.x for MongoDB Atlas compatibility.')
      console.log('   Current Node.js version:', process.version)
      console.log('   Please use nvm to switch to Node.js v20.11.1:')
      console.log('   nvm use 20.11.1')
    } else if (error.message.includes('AuthenticationFailed')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:')
      console.log('   Authentication failed. Please check your MongoDB credentials.')
      console.log('   Ensure your MONGODB_URI in .env.local has correct username/password.')
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:')
      console.log('   DNS resolution failed. Check your MongoDB URI and network connectivity.')
    }
    
    return false
  }
}

// Test static assets
function testStaticAssets() {
  console.log('\n📂 Testing static assets...')
  
  const publicDir = path.join(__dirname, '..', 'public')
  if (!fs.existsSync(publicDir)) {
    console.log('⚠️  Public directory not found')
    return false
  }
  
  const files = fs.readdirSync(publicDir)
  console.log(`✅ Public directory exists with ${files.length} items`)
  
  // Check for essential files
  const essentialFiles = ['favicon.ico']
  for (const file of essentialFiles) {
    const filePath = path.join(publicDir, file)
    if (fs.existsSync(filePath)) {
      console.log(`✅ Essential file found: ${file}`)
    } else {
      console.log(`⚠️  Essential file missing: ${file}`)
    }
  }
  
  return true
}

// Run all health checks
async function runHealthChecks() {
  console.log('\n🏥 Running comprehensive health checks...')
  
  const dbSuccess = await testMongoDBConnection()
  const assetsSuccess = testStaticAssets()
  
  console.log('\n📋 Health check summary:')
  console.log(`   Database connectivity: ${dbSuccess ? '✅' : '❌'}`)
  console.log(`   Static assets: ${assetsSuccess ? '✅' : '⚠️'}`)
  
  if (dbSuccess && assetsSuccess) {
    console.log('\n🎉 All health checks passed!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some health checks failed or had warnings')
    process.exit(1)
  }
}

// Run the health checks
runHealthChecks().catch(error => {
  console.error('❌ Health check failed with error:', error)
  process.exit(1)
})