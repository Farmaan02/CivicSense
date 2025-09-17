import Team from "./models/team.js"

const seedTeams = [
  {
    name: "Public Works Alpha",
    description: "Primary infrastructure maintenance and repair team",
    department: "public-works",
    members: [
      { name: "John Smith", email: "j.smith@city.gov", role: "lead" },
      { name: "Maria Garcia", email: "m.garcia@city.gov", role: "member" },
      { name: "David Chen", email: "d.chen@city.gov", role: "specialist" },
    ],
    specialties: ["infrastructure", "maintenance"],
    capacity: 8,
    currentLoad: 3,
    contactInfo: {
      phone: "(555) 123-4567",
      email: "publicworks.alpha@city.gov",
      location: "City Maintenance Facility A",
    },
  },
  {
    name: "Emergency Response Unit",
    description: "Rapid response team for urgent safety issues",
    department: "emergency-services",
    members: [
      { name: "Sarah Johnson", email: "s.johnson@city.gov", role: "lead" },
      { name: "Mike Rodriguez", email: "m.rodriguez@city.gov", role: "member" },
      { name: "Lisa Park", email: "l.park@city.gov", role: "member" },
    ],
    specialties: ["safety", "emergency"],
    capacity: 6,
    currentLoad: 1,
    contactInfo: {
      phone: "(555) 911-0000",
      email: "emergency@city.gov",
      location: "Emergency Services HQ",
    },
    workingHours: {
      start: "00:00",
      end: "23:59",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    },
  },
  {
    name: "Environmental Services",
    description: "Environmental cleanup and monitoring specialists",
    department: "environmental",
    members: [
      { name: "Dr. Amanda White", email: "a.white@city.gov", role: "lead" },
      { name: "Carlos Martinez", email: "c.martinez@city.gov", role: "specialist" },
    ],
    specialties: ["environment"],
    capacity: 4,
    currentLoad: 2,
    contactInfo: {
      phone: "(555) 234-5678",
      email: "environmental@city.gov",
      location: "Environmental Services Building",
    },
  },
  {
    name: "Parks & Recreation Crew",
    description: "Maintenance and improvement of public parks and recreational facilities",
    department: "parks-recreation",
    members: [
      { name: "Tom Wilson", email: "t.wilson@city.gov", role: "lead" },
      { name: "Jennifer Lee", email: "j.lee@city.gov", role: "member" },
      { name: "Robert Brown", email: "r.brown@city.gov", role: "member" },
    ],
    specialties: ["public-services", "maintenance"],
    capacity: 7,
    currentLoad: 4,
    contactInfo: {
      phone: "(555) 345-6789",
      email: "parks@city.gov",
      location: "Parks Department Office",
    },
  },
  {
    name: "Utilities Maintenance",
    description: "Water, sewer, and electrical infrastructure specialists",
    department: "utilities",
    members: [
      { name: "Frank Davis", email: "f.davis@city.gov", role: "lead" },
      { name: "Nancy Kim", email: "n.kim@city.gov", role: "specialist" },
      { name: "Steve Thompson", email: "s.thompson@city.gov", role: "member" },
    ],
    specialties: ["infrastructure", "maintenance"],
    capacity: 6,
    currentLoad: 2,
    contactInfo: {
      phone: "(555) 456-7890",
      email: "utilities@city.gov",
      location: "Utilities Operations Center",
    },
  },
]

async function seedTeamsData() {
  try {
    console.log("Seeding teams data...")

    // Clear existing teams
    await Team.deleteMany({})

    // Insert seed teams
    const teams = await Team.insertMany(seedTeams)

    console.log(`Successfully seeded ${teams.length} teams`)
    return teams
  } catch (error) {
    console.error("Error seeding teams:", error)
    throw error
  }
}

export { seedTeamsData, seedTeams }
