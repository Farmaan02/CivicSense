import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In-memory database seeding (for development without MongoDB)
export function seedInMemoryDatabase() {
  try {
    const seedDataPath = path.join(__dirname, "../db/seed/seed-reports.json")
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"))

    console.log(`[v0] Loading ${seedData.length} seed reports...`)

    // Transform seed data to match in-memory format
    const reports = seedData.map((report, index) => ({
      id: (index + 1).toString(),
      ...report,
    }))

    console.log("[v0] Seed data loaded successfully:")
    reports.forEach((report) => {
      console.log(`[v0]   - ${report.trackingId}: ${report.description.substring(0, 50)}...`)
    })

    return reports
  } catch (error) {
    console.error("[v0] Error loading seed data:", error)
    return []
  }
}

// MongoDB seeding function (for when MongoDB is connected)
export async function seedMongoDatabase(mongoose, Report) {
  try {
    // Check if database already has data
    const existingCount = await Report.countDocuments()
    if (existingCount > 0) {
      console.log(`[v0] Database already contains ${existingCount} reports. Skipping seed.`)
      return
    }

    const seedDataPath = path.join(__dirname, "../db/seed/seed-reports.json")
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"))

    console.log(`[v0] Seeding MongoDB with ${seedData.length} reports...`)

    // Insert seed data
    const insertedReports = await Report.insertMany(seedData)

    console.log(`[v0] Successfully seeded ${insertedReports.length} reports:`)
    insertedReports.forEach((report) => {
      console.log(`[v0]   - ${report.trackingId}: ${report.description.substring(0, 50)}...`)
    })
  } catch (error) {
    console.error("[v0] Error seeding MongoDB:", error)
    throw error
  }
}

// CLI script for manual seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("[v0] Running database seed script...")

  // For now, just show what would be seeded
  const reports = seedInMemoryDatabase()
  console.log(`[v0] Would seed ${reports.length} reports to database`)

  // TODO: Add MongoDB connection and seeding when database is configured
  console.log("[v0] To use with MongoDB, configure connection string and run with --mongo flag")
}
