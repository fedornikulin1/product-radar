import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const password = body.password;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Неверный пароль' },
      { status: 401 },
    );
  }

  const token = generateAdminToken();

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
