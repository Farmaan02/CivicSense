#!/usr/bin/env node

// Script to check Node.js version compatibility
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Node.js Version Compatibility Check')
console.log('=====================================')

// Check current Node.js version
const currentVersion = process.version
console.log(`Current Node.js version: ${currentVersion}`)

// Read .nvmrc file to get required version
const nvmrcPath = path.join(__dirname, '..', '.nvmrc')
let requiredVersion = '20.x'

try {
  if (fs.existsSync(nvmrcPath)) {
    requiredVersion = fs.readFileSync(nvmrcPath, 'utf8').trim()
    console.log(`Required Node.js version (from .nvmrc): ${requiredVersion}`)
  } else {
    console.log('No .nvmrc file found, using default requirement: 20.x')
  }
} catch (error) {
  console.log('Error reading .nvmrc file, using default requirement: 20.x')
}

// Check if current version matches required version
const isCompatible = currentVersion.startsWith(`v${requiredVersion}`) || 
                    (requiredVersion === '20.x' && currentVersion.startsWith('v20.'))

if (isCompatible) {
  console.log('✅ Node.js version is compatible')
} else {
  console.log('❌ Node.js version is NOT compatible')
  console.log('\n🔧 To fix this issue:')
  
  if (process.platform === 'win32') {
    console.log('   1. Install nvm-windows from: https://github.com/coreybutler/nvm-windows')
    console.log('   2. Run: nvm install 20.11.1')
    console.log('   3. Run: nvm use 20.11.1')
  } else {
    console.log('   1. Install nvm from: https://github.com/nvm-sh/nvm')
    console.log('   2. Run: nvm install 20.11.1')
    console.log('   3. Run: nvm use 20.11.1')
  }
  
  console.log('\n   Alternatively, you can:')
  console.log('   - Use Docker to run the application (recommended)')
  console.log('   - Check the docker-compose.yml file for containerized setup')
}

// Additional MongoDB compatibility check
if (currentVersion.startsWith('v24.')) {
  console.log('\n⚠️  Warning: Node.js v24.x has known SSL/TLS compatibility issues with MongoDB Atlas')
  console.log('   This may cause "tlsv1 alert internal error" when connecting to MongoDB')
}

console.log('\n🏥 Run "npm run health" to verify MongoDB connectivity')