// pages/api/test-db.js
import { connectDB } from "../../lib/mongoose";
import User from "../../models/User";

export default async function handler(req, res) {
  try {
    await connectDB();

    // test user create
    const user = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
