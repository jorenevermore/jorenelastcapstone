import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Get superadmin credentials from environment variables
    const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
    const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
    const SUPERADMIN_SECRET_KEY = process.env.SUPERADMIN_SECRET_KEY;

    // Validate environment variables are set
    if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD || !SUPERADMIN_SECRET_KEY) {
      console.error('SuperAdmin environment variables not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check credentials
    if (email === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD) {
      // Log successful authentication
      console.log(`SuperAdmin authentication successful for: ${email} at ${new Date().toISOString()}`);

      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now()
      });
    } else {
      // Log failed authentication attempt
      console.warn(`SuperAdmin authentication failed for: ${email} at ${new Date().toISOString()}`);

      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('SuperAdmin authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
