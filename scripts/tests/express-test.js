import request from "supertest";
import { app } from "./test-app.js";

// Simple test to verify the app is working
async function testApp() {
  console.log("Testing basic route access...");
  
  try {
    const response = await request(app).get("/health").expect(200);
    console.log("✓ Health check route works");
    console.log("Response:", response.body);
  } catch (error) {
    console.log("✗ Health check route failed:", error.message);
  }
  
  try {
    const response = await request(app).get("/reports").expect(200);
    console.log("✓ GET /reports route works");
    console.log("Response:", response.body);
  } catch (error) {
    console.log("✗ GET /reports route failed:", error.message);
  }
  
  try {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "admin123" })
      .expect(200);
    console.log("✓ POST /auth/login route works");
    console.log("Response:", response.body);
  } catch (error) {
    console.log("✗ POST /auth/login route failed:", error.message);
  }
}

testApp();