// app/api/test-db/route.ts
export async function GET() {
  // Completely skip this route during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Build phase - skipping database operations',
      skipped: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Only attempt database connection during runtime
  try {
    const { default: connectToDatabase } = await import("@/lib/mongodb");
    const { default: User } = await import("@/lib/models/User");
    
    await connectToDatabase();

    // test user create
    const user = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
    });

    return new Response(JSON.stringify({ success: true, user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}