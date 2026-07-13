import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProject,
  getProjectById,
  isProjectPublic,
  setProjectBitrixDealId,
  toPublicProject,
  updateProject,
} from '@/lib/projectsStore';
import { syncProjectToBitrix } from '@/lib/bitrix24';
import { verifyAdminToken } from '@/utils/auth';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'ID проекта не передан' },
      { status: 400 },
    );
  }

  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json(
      { error: 'Проект не найден' },
      { status: 404 },
    );
  }

  const token = request.cookies.get('admin_token')?.value;
  const isAdmin = verifyAdminToken(token);

  if (!isAdmin && !isProjectPublic(project)) {
    return NextResponse.json(
      { error: 'Проект не найден' },
      { status: 404 },
    );
  }

  return NextResponse.json(isAdmin ? project : toPublicProject(project));
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'ID проекта не передан' },
      { status: 400 },
    );
  }

  const body = await request.json();

  let project = await updateProject(id, body);

  if (!project) {
    return NextResponse.json(
      { error: 'Проект не найден' },
      { status: 404 },
    );
  }

  const bitrixResult = await syncProjectToBitrix(project);

  if (bitrixResult?.dealId) {
    project =
      (await setProjectBitrixDealId(
        project.id,
        bitrixResult.dealId,
        bitrixResult.companyId,
      )) || project;
  }

  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'ID проекта не передан' },
      { status: 400 },
    );
  }

  const deleted = await deleteProject(id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Проект не найден' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
