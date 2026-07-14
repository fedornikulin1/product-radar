import { NextRequest, NextResponse } from 'next/server';
import { getProjectsFromBitrix } from '@/lib/bitrix24';
import { upsertProjectFromBitrix } from '@/lib/projectsStore';
import { verifyAdminToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const projects = await getProjectsFromBitrix();
  let created = 0;
  let updated = 0;
  let failed = 0;
  const results: Array<{
    title: string;
    ok: boolean;
    created?: boolean;
    error?: string;
  }> = [];

  for (const project of projects) {
    try {
      const result = await upsertProjectFromBitrix(project);

      if (result.created) {
        created += 1;
      } else {
        updated += 1;
      }

      results.push({
        title: project.title,
        ok: true,
        created: result.created,
      });
    } catch (error) {
      failed += 1;
      results.push({
        title: project.title || 'Проект без названия',
        ok: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  return NextResponse.json({
    total: projects.length,
    created,
    updated,
    failed,
    results,
  });
}
