import { NextRequest, NextResponse } from 'next/server';
import { getProjectsFromBitrix } from '@/lib/bitrix24';
import { upsertProjectFromBitrix } from '@/lib/projectsStore';
import { verifyAdminToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  if (process.env.BITRIX24_ALLOW_IMPORT !== 'true') {
    return NextResponse.json(
      {
        error:
          'Import from Bitrix24 is disabled to protect site project data.',
      },
      { status: 403 },
    );
  }

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

  for (const project of projects) {
    const result = await upsertProjectFromBitrix(project);

    if (result.created) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  return NextResponse.json({
    total: projects.length,
    created,
    updated,
  });
}
