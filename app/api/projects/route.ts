import { NextRequest, NextResponse } from 'next/server';
import {
  createProject,
  getProjects,
  isProjectPublic,
  toPublicProject,
} from '@/lib/projectsStore';
import { verifyAdminToken } from '@/utils/auth';

type SortField = 'created_at' | 'title';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'created_at.desc';

  let projects = await getProjects();
  const token = request.cookies.get('admin_token')?.value;
  const isAdmin = verifyAdminToken(token);

  if (!isAdmin) {
    projects = projects
      .filter(isProjectPublic)
      .map(toPublicProject);
  }

  if (search) {
    projects = projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(search) ||
        project.short_description.toLowerCase().includes(search) ||
        project.full_description.toLowerCase().includes(search)
      );
    });
  }

  if (category) {
    projects = projects.filter((project) =>
      project.categories.includes(category),
    );
  }

  if (status) {
    projects = projects.filter((project) => project.status === status);
  }

  const [requestedField, requestedDirection] = sort.split('.');
  const field: SortField = requestedField === 'title' ? 'title' : 'created_at';
  const direction = requestedDirection === 'asc' ? 'asc' : 'desc';

  projects.sort((a, b) => {
    const aValue = a[field] || '';
    const bValue = b[field] || '';

    if (direction === 'asc') {
      return String(aValue).localeCompare(String(bValue));
    }

    return String(bValue).localeCompare(String(aValue));
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const body = await request.json();

  const project = await createProject(body);

  return NextResponse.json(project, { status: 201 });
}
