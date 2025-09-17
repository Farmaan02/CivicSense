// Note: This script runs in the MongoDB shell context where 'db' is a global variable

const civicareDb = db.getSiblingDB("civicare")

// Create collections
civicareDb.createCollection("reports")
civicareDb.createCollection("teams")
civicareDb.createCollection("users")

// Create indexes for better performance
civicareDb.reports.createIndex({ trackingId: 1 }, { unique: true })
civicareDb.reports.createIndex({ status: 1 })
civicareDb.reports.createIndex({ createdAt: -1 })
civicareDb.reports.createIndex({ "location.coordinates": "2dsphere" })

civicareDb.teams.createIndex({ name: 1 }, { unique: true })
civicareDb.users.createIndex({ username: 1 }, { unique: true })

// Insert seed data
civicareDb.reports.insertMany([
  {
    trackingId: "RPT-20241215-0001",
    description: "Large pothole on Main Street causing traffic issues",
    status: "reported",
    priority: "high",
    category: "infrastructure",
    anonymous: false,
    contactInfo: "citizen@example.com",
    location: {
      type: "Point",
      coordinates: [-74.006, 40.7128],
      address: "Main Street, New York, NY",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "citizen@example.com",
    assignedTo: null,
    updates: [],
  },
  {
    trackingId: "RPT-20241215-0002",
    description: "Broken streetlight on Oak Avenue",
    status: "in-progress",
    priority: "medium",
    category: "infrastructure",
    anonymous: true,
    contactInfo: null,
    location: {
      type: "Point",
      coordinates: [-73.9851, 40.7589],
      address: "Oak Avenue, New York, NY",
    },
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(),
    createdBy: "anonymous",
    assignedTo: "infrastructure-team",
    updates: [
      {
        type: "assignment",
        message: "Report assigned to infrastructure team",
        createdBy: "admin",
        createdAt: new Date(),
      },
    ],
  },
])

civicareDb.teams.insertMany([
  {
    name: "Infrastructure Team",
    description: "Handles road, bridge, and utility infrastructure issues",
    category: "infrastructure",
    contactEmail: "infrastructure@city.gov",
    phone: "+1-555-0101",
    createdAt: new Date(),
    active: true,
  },
  {
    name: "Parks & Recreation",
    description: "Manages park maintenance and recreational facilities",
    category: "parks",
    contactEmail: "parks@city.gov",
    phone: "+1-555-0102",
    createdAt: new Date(),
    active: true,
  },
  {
    name: "Public Safety",
    description: "Addresses safety concerns and emergency issues",
    category: "safety",
    contactEmail: "safety@city.gov",
    phone: "+1-555-0103",
    createdAt: new Date(),
    active: true,
  },
])

print("Database initialized with seed data")
