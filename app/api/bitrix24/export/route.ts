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

  for (const project of projects) {
    const result = await syncProjectToBitrix(project);

    if (result?.dealId) {
      await setProjectBitrixDealId(
        project.id,
        result.dealId,
        result.companyId,
      );
      synced += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    total: projects.length,
    synced,
    failed,
  });
}
