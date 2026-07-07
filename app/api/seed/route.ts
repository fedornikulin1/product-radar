import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { seedProjects } from '@/data/seedProjects';
import { verifyAdminToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'projects.json');

    await fs.writeFile(
      filePath,
      JSON.stringify(seedProjects, null, 2),
      'utf-8',
    );

    return NextResponse.json({
      success: true,
      count: seedProjects.length,
      message: 'Демо-проекты успешно записаны',
    });
  } catch (error) {
    console.error('Seed error:', error);

    return NextResponse.json(
      { error: 'Не удалось заполнить демо-данные' },
      { status: 500 },
    );
  }
}