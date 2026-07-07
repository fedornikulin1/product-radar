import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  const isAdmin = verifyAdminToken(token);

  return NextResponse.json({
    isAdmin,
  });
}