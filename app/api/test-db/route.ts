// app/api/test-db/route.ts
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    // test user create
    const user = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
    });

    return Response.json({ success: true, user });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}