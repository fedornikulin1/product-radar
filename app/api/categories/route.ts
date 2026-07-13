import { NextResponse } from 'next/server';
import { PROJECT_CATEGORIES } from '@/lib/projectOptions';
import { getProjects } from '@/lib/projectsStore';

export async function GET() {
  const projects = await getProjects();
  const categories = new Set<string>(PROJECT_CATEGORIES);

  projects.forEach((project) => {
    project.categories.forEach((category) => {
      const trimmedCategory = category.trim();

      if (trimmedCategory) {
        categories.add(trimmedCategory);
      }
    });
  });

  return NextResponse.json(Array.from(categories).sort((a, b) => a.localeCompare(b)));
}
