import { NextRequest, NextResponse } from 'next/server';
import { SuperAdminAuthService } from '../../../../lib/services/auth/SuperAdminAuthService';

const authService = new SuperAdminAuthService();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // auth using service
    const result = await authService.authenticate({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.error === 'CONFIG_ERROR' ? 500 : 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: result.data?.timestamp
    });
  } catch (error) {
    console.error('SuperAdmin authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
