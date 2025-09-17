#!/usr/bin/env node

// Health check script for CivicSense backend
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 CivicSense Health Check')
console.log('========================')

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

console.log('\n🏥 Health check completed')