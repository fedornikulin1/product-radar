import { Project, ProjectFormData } from '@/types/project';

type CompletenessProject = Partial<Project | ProjectFormData>;

function hasText(value?: string) {
  return Boolean(value?.trim());
}

function hasItems<T>(value?: T[]) {
  return Array.isArray(value) && value.length > 0;
}

export function calculateProjectCompleteness(project: CompletenessProject) {
  const checks = [
    hasText(project.title),
    hasText(project.short_description),
    hasItems(project.categories),
    Boolean(project.price),
    hasText(project.telegram),
    hasText(project.contact_email),
    hasText(project.full_description),
    hasText(project.for_whom),
    hasText(project.problem),
    hasText(project.solution),
    hasText(project.advantages),
    hasText(project.cta),
    hasText(project.technologies),
    Boolean(project.status),
    Boolean(project.investment_stage),
    hasItems(project.audience_types),
    hasItems(project.placement_types),
    hasText(project.country),
    hasText(project.city),
    hasText(project.presentation_url) || hasItems(project.gallery_urls),
    hasItems(project.team_members) || hasItems(project.team_open_roles),
    hasItems(project.cooperation_needs) || hasText(project.cooperation_offer),
  ];

  const filled = checks.filter(Boolean).length;

  return Math.round((filled / checks.length) * 100);
}
