import request from "supertest"
import { app } from "./test-app.js"

// Set up mock admins for testing with correct password hash
global.admins = [
  {
    id: "1",
    username: "admin",
    email: "admin@civicsense.local",
    password: "$2a$10$y44LPR5LnfUkDaeIGoJ.4emvflpoYDPEUL6HG7hvB3fUtZozRw/w6", // 'admin123' hashed
    role: "super-admin",
    permissions: [
      "view-reports",
      "assign-reports",
      "update-status",
      "manage-teams",
      "manage-users",
      "view-analytics",
      "export-data",
      "system-settings",
    ],
    profile: {
      firstName: "System",
      lastName: "Administrator",
      position: "Super Administrator",
    },
    isActive: true,
    guestToken: null,
    createdAt: new Date().toISOString(),
  }
]

describe("Auth API Integration", () => {
  // Auth tests don't need MongoDB, so we don't set up MongoMemoryServer
  
  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          username: "admin",
          password: "admin123"
        })
        .expect(200)

      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("admin")
      expect(response.body.admin).toHaveProperty("id", "1")
      expect(response.body.admin).toHaveProperty("username", "admin")
      expect(response.body.admin).toHaveProperty("email", "admin@civicsense.local")
      expect(response.body.admin).toHaveProperty("role", "super-admin")
    })

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          username: "admin",
          password: "wrongpassword"
        })
        .expect(401)

      expect(response.body).toHaveProperty("error", "Invalid credentials")
    })

    it("should return 400 when username or password is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          username: "admin"
          // Missing password
        })
        .expect(400)

      expect(response.body).toHaveProperty("error", "Username and password are required")
    })
  })

  describe("POST /auth/guest", () => {
    beforeEach(() => {
      // Set guest password for testing
      process.env.GUEST_PASSWORD = "guest123"
    })

    it("should generate guest token successfully", async () => {
      const response = await request(app)
        .post("/auth/guest")
        .send({
          password: "guest123"
        })
        .expect(200)

      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("expiresAt")
      expect(response.body).toHaveProperty("admin")
      expect(response.body.admin).toHaveProperty("id", "guest")
      expect(response.body.admin).toHaveProperty("username", "guest")
      expect(response.body.admin).toHaveProperty("role", "guest")
    })

    it("should return 401 for invalid guest password", async () => {
      const response = await request(app)
        .post("/auth/guest")
        .send({
          password: "wrongpassword"
        })
        .expect(401)

      expect(response.body).toHaveProperty("error", "Invalid guest password")
    })
  })

  describe("GET /auth/verify", () => {
    let validToken

    beforeEach(async () => {
      // Get a valid token first
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          username: "admin",
          password: "admin123"
        })
      validToken = loginResponse.body.token
    })

    it("should verify a valid token", async () => {
      const response = await request(app)
        .get("/auth/verify")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("valid", true)
      expect(response.body).toHaveProperty("admin")
      expect(response.body.admin).toHaveProperty("id", "1")
      expect(response.body.admin).toHaveProperty("username", "admin")
    })

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/auth/verify")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)

      expect(response.body).toHaveProperty("error", "Invalid token")
    })

    it("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/auth/verify")
        .expect(401)

      expect(response.body).toHaveProperty("error", "No token provided")
    })
  })

  describe("GET /auth/me", () => {
    let validToken

    beforeEach(async () => {
      // Get a valid token first
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          username: "admin",
          password: "admin123"
        })
      console.log("[Test] Login response:", JSON.stringify(loginResponse.body, null, 2))
      validToken = loginResponse.body.token
      console.log("[Test] Generated token:", validToken ? validToken.substring(0, 10) + "..." : "none")
    })

    it("should return current admin info", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("id", "1")
      expect(response.body).toHaveProperty("username", "admin")
      expect(response.body).toHaveProperty("email", "admin@civicsense.local")
      expect(response.body).toHaveProperty("role", "super-admin")
    })

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)

      console.log("[Test] Invalid token response:", JSON.stringify(response.body, null, 2))
      // Check that we get an error response
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toBe("Invalid or expired token")
    })

  })
})