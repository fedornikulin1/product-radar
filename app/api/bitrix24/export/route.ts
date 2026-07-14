import { NextRequest, NextResponse } from 'next/server';
import { syncProjectToBitrix } from '@/lib/bitrix24';
import {
  getProjects,
  setProjectBitrixDealId,
} from '@/lib/projectsStore';
import { verifyAdminToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await getProjects();
  let synced = 0;
  let failed = 0;
  const results: Array<{
    id: string;
    title: string;
    ok: boolean;
    dealId?: number;
    companyId?: number;
    error?: string;
  }> = [];

  for (const project of projects) {
    try {
      const result = await syncProjectToBitrix(project);

      if (result?.dealId) {
        await setProjectBitrixDealId(
          project.id,
          result.dealId,
          result.companyId,
        );
        synced += 1;
        results.push({
          id: project.id,
          title: project.title,
          ok: true,
          dealId: result.dealId,
          companyId: result.companyId,
        });
      } else {
        failed += 1;
        results.push({
          id: project.id,
          title: project.title,
          ok: false,
          error: 'Битрикс не вернул ID сделки',
        });
      }
    } catch (error) {
      failed += 1;
      results.push({
        id: project.id,
        title: project.title,
        ok: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  return NextResponse.json({
    total: projects.length,
    synced,
    failed,
    results,
  });
}
