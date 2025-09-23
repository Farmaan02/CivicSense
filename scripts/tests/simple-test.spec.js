import request from "supertest"
import { app } from "./test-app.js"

console.log("App imported in test");

describe("Simple Test", () => {
  it("should return health check", async () => {
    console.log("Making request to /health");
    const response = await request(app)
      .get("/health")
      .expect(200)

    expect(response.body).toHaveProperty("status", "OK")
  })

  it("should return reports", async () => {
    console.log("Making request to /reports");
    const response = await request(app)
      .get("/reports")
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
  })
})