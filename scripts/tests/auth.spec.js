import request from "supertest"
import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Create test app
function createTestApp() {
  const app = express()
  
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  
  // Mock user database
  const users = [
    {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 10), // Hashed password
      role: "user"
    }
  ]
  
  // Mock JWT secret
  const JWT_SECRET = "test-jwt-secret-for-testing-purposes-only"
  
  // Login endpoint
  app.post("/auth/login", (req, res) => {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email and password are required" 
        })
      }
      
      const user = users.find(u => u.email === email)
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ 
          error: "Invalid email or password" 
        })
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      )
      
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Login failed" })
    }
  })
  
  // Register endpoint
  app.post("/auth/register", (req, res) => {
    try {
      const { name, email, password } = req.body
      
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "Name, email, and password are required" 
        })
      }
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email)
      if (existingUser) {
        return res.status(409).json({ 
          error: "User with this email already exists" 
        })
      }
      
      // Create new user
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        role: "user"
      }
      
      users.push(newUser)
      
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      )
      
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ error: "Registration failed" })
    }
  })
  
  return app
}

describe("Auth API", () => {
  let app
  
  beforeEach(() => {
    app = createTestApp()
  })
  
  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123"
        })
        .expect(200)
      
      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("user")
      expect(response.body.user).toHaveProperty("id")
      expect(response.body.user).toHaveProperty("name", "Test User")
      expect(response.body.user).toHaveProperty("email", "test@example.com")
      expect(response.body.user).toHaveProperty("role", "user")
    })
    
    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword"
        })
        .expect(401)
      
      expect(response.body).toHaveProperty("error", "Invalid email or password")
    })
    
    it("should return 400 when email or password is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com"
          // Missing password
        })
        .expect(400)
      
      expect(response.body).toHaveProperty("error", "Email and password are required")
    })
  })
  
  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "New User",
          email: "newuser@example.com",
          password: "newpassword123"
        })
        .expect(201)
      
      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("user")
      expect(response.body.user).toHaveProperty("id")
      expect(response.body.user).toHaveProperty("name", "New User")
      expect(response.body.user).toHaveProperty("email", "newuser@example.com")
      expect(response.body.user).toHaveProperty("role", "user")
    })
    
    it("should return 409 when trying to register with existing email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Another User",
          email: "test@example.com", // Existing email
          password: "anotherpassword123"
        })
        .expect(409)
      
      expect(response.body).toHaveProperty("error", "User with this email already exists")
    })
    
    it("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Incomplete User"
          // Missing email and password
        })
        .expect(400)
      
      expect(response.body).toHaveProperty("error", "Name, email, and password are required")
    })
  })
})