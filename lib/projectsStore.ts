import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  AudienceType,
  PlacementType,
  Project,
  ProjectChange,
  ProjectCRM,
  ProjectFormData,
  ReadinessKey,
  TeamMember,
} from '@/types/project';
import { calculateProjectCompleteness } from '@/lib/projectCompleteness';

const filePath = path.join(process.cwd(), 'data', 'projects.json');

async function ensureFile() {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
}

function normalizeAudienceTypes(project: Partial<Project>): AudienceType[] {
  if (Array.isArray(project.audience_types) && project.audience_types.length > 0) {
    return project.audience_types.filter(Boolean) as AudienceType[];
  }

  if (project.audience_type === 'b2b_b2c') {
    return ['b2b', 'b2c'];
  }

  if (
    project.audience_type === 'b2b' ||
    project.audience_type === 'b2c' ||
    project.audience_type === 'b2g'
  ) {
    return [project.audience_type];
  }

  return ['b2b'];
}

function normalizePlacementTypes(project: Partial<Project>): PlacementType[] {
  if (Array.isArray(project.placement_types) && project.placement_types.length) {
    return Array.from(new Set(project.placement_types)).filter(
      (type): type is PlacementType =>
        type === 'saas' || type === 'on_premise',
    );
  }

  if (project.placement_type === 'saas' || project.placement_type === 'on_premise') {
    return [project.placement_type];
  }

  return ['saas'];
}

function normalizeTeamMembers(teamMembers?: TeamMember[]) {
  if (!Array.isArray(teamMembers)) return [];

  return teamMembers
    .filter((member) => member && (member.name || member.role || member.bio))
    .map((member) => ({
      id: member.id || uuidv4(),
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      telegram: member.telegram || '',
      linkedin: member.linkedin || '',
    }));
}

function normalizeCRM(crm?: ProjectCRM): ProjectCRM {
  return {
    owner: crm?.owner || '',
    priority: crm?.priority || 'medium',
    status: crm?.status === 'ready_for_showcase' ? 'ready_for_showcase' : 'internal_review',
    notes: crm?.notes || '',
    last_contact_at: crm?.last_contact_at || '',
    next_action: crm?.next_action || '',
    bitrix_deal_id: crm?.bitrix_deal_id,
    bitrix_company_id: crm?.bitrix_company_id,
  };
}

function normalizeChangeLog(changeLog?: ProjectChange[]) {
  if (!Array.isArray(changeLog)) return [];

  return changeLog.map((item) => ({
    id: item.id || uuidv4(),
    created_at: item.created_at || new Date().toISOString(),
    type: item.type || 'updated',
    text: item.text || 'Проект обновлён',
    public: item.public ?? true,
  }));
}

function buildChange(
  type: ProjectChange['type'],
  text: string,
  createdAt: string,
  isPublic = true,
): ProjectChange {
  return {
    id: uuidv4(),
    created_at: createdAt,
    type,
    text,
    public: isPublic,
  };
}

function normalizeProject(project: Partial<Project>): Project {
  const audienceTypes = normalizeAudienceTypes(project);
  const placementTypes = normalizePlacementTypes(project);
  const readinessItems = Array.isArray(project.readiness_items)
    ? (Array.from(new Set(project.readiness_items)) as ReadinessKey[])
    : [];

  const normalizedProject: Project = {
    id: project.id || uuidv4(),

    title: project.title || '',
    short_description: project.short_description || '',
    logo_url: project.logo_url || '',

    categories: Array.isArray(project.categories) ? project.categories : [],
    price: project.price || 'free',

    link: project.link || '',
    telegram: project.telegram || '',
    contact_email: project.contact_email || '',
    contact_phone: project.contact_phone || '',
    presentation_url: project.presentation_url || '',

    full_description: project.full_description || '',
    for_whom: project.for_whom || '',
    problem: project.problem || '',
    solution: project.solution || '',
    advantages: project.advantages || '',
    cta: project.cta || '',
    additional: project.additional || '',

    gallery_urls: Array.isArray(project.gallery_urls) ? project.gallery_urls : [],
    video_url: project.video_url || '',

    technologies: project.technologies || '',

    status: project.status || 'developing',
    investment_stage: project.investment_stage || 'pre_seed',
    investment_amount: project.investment_amount || '',

    audience_type: audienceTypes[0],
    audience_types: audienceTypes,
    placement_type: placementTypes[0],
    placement_types: placementTypes,

    community_statuses: Array.isArray(project.community_statuses)
      ? project.community_statuses
      : [],

    country: project.country || '',
    city: project.city || '',

    team_members: normalizeTeamMembers(project.team_members),
    team_open_roles: Array.isArray(project.team_open_roles)
      ? project.team_open_roles.filter(Boolean)
      : [],

    readiness_items: readinessItems,
    readiness_score: 0,

    cooperation_needs: Array.isArray(project.cooperation_needs)
      ? project.cooperation_needs.filter(Boolean)
      : [],
    cooperation_offer: project.cooperation_offer || '',
    cooperation_priority: project.cooperation_priority || 'later',

    change_log: normalizeChangeLog(project.change_log),
    crm: normalizeCRM(project.crm),

    created_at: project.created_at || new Date().toISOString(),
    updated_at: project.updated_at || new Date().toISOString(),
  };

  return {
    ...normalizedProject,
    readiness_score: calculateProjectCompleteness(normalizedProject),
  };
}

async function readRawProjects(): Promise<Partial<Project>[]> {
  await ensureFile();

  const file = await fs.readFile(filePath, 'utf-8');

  try {
    return JSON.parse(file);
  } catch {
    return [];
  }
}

export async function getProjects(): Promise<Project[]> {
  const rawProjects = await readRawProjects();
  return rawProjects.map(normalizeProject);
}

export async function saveProjects(projects: Project[]) {
  await ensureFile();
  await fs.writeFile(filePath, JSON.stringify(projects, null, 2), 'utf-8');
}

export async function getProjectById(id: string) {
  const projects = await getProjects();
  return projects.find((project) => project.id === id) || null;
}

export function isProjectPublic(project: Project) {
  return project.crm?.status === 'ready_for_showcase';
}

export function toPublicProject(project: Project): Project {
  const publicProject = { ...project };
  delete publicProject.crm;

  return {
    ...publicProject,
    change_log: (project.change_log || []).filter(
      (change) => change.public !== false,
    ),
  };
}

function formDataToProjectData(
  data: ProjectFormData,
): Omit<Project, 'id' | 'created_at' | 'updated_at' | 'change_log'> {
  const audienceTypes: AudienceType[] =
    Array.isArray(data.audience_types) && data.audience_types.length > 0
      ? data.audience_types
      : ['b2b'];

  const readinessItems: ReadinessKey[] = Array.isArray(data.readiness_items)
    ? Array.from(new Set(data.readiness_items))
    : [];
  const placementTypes = normalizePlacementTypes(data);

  return {
    ...data,
    audience_type: audienceTypes[0] as AudienceType,
    audience_types: audienceTypes,
    placement_type: placementTypes[0],
    placement_types: placementTypes,
    investment_amount: data.investment_amount || '',
    team_members: normalizeTeamMembers(data.team_members),
    team_open_roles: Array.isArray(data.team_open_roles)
      ? data.team_open_roles.filter(Boolean)
      : [],
    readiness_items: readinessItems,
    readiness_score: calculateProjectCompleteness(data),
    cooperation_needs: Array.isArray(data.cooperation_needs)
      ? data.cooperation_needs.filter(Boolean)
      : [],
    cooperation_offer: data.cooperation_offer || '',
    cooperation_priority: data.cooperation_priority || 'later',
    crm: normalizeCRM(data.crm),
  };
}

function areEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function buildUpdateChanges(previous: Project, next: Project, now: string) {
  const changes: ProjectChange[] = [];

  if (previous.investment_stage !== next.investment_stage) {
    changes.push(
      buildChange(
        'stage_changed',
        `Стадия проекта обновлена: ${previous.investment_stage} → ${next.investment_stage}`,
        now,
        true,
      ),
    );
  }

  if (!previous.presentation_url && next.presentation_url) {
    changes.push(
      buildChange(
        'presentation_uploaded',
        'Добавлена презентация проекта.',
        now,
        true,
      ),
    );
  }

  if (!areEqual(previous.gallery_urls, next.gallery_urls)) {
    changes.push(
      buildChange(
        'materials_updated',
        'Обновлены материалы проекта.',
        now,
        true,
      ),
    );
  }

  if (
    !areEqual(previous.team_members, next.team_members) ||
    !areEqual(previous.team_open_roles, next.team_open_roles)
  ) {
    changes.push(
      buildChange(
        'team_updated',
        'Обновлена информация о команде.',
        now,
        true,
      ),
    );
  }

  if (
    !areEqual(previous.readiness_items, next.readiness_items) ||
    previous.readiness_score !== next.readiness_score
  ) {
    changes.push(
      buildChange(
        'readiness_updated',
        'Обновлена готовность проекта.',
        now,
        true,
      ),
    );
  }

  if (
    !areEqual(previous.cooperation_needs, next.cooperation_needs) ||
    previous.cooperation_offer !== next.cooperation_offer ||
    previous.cooperation_priority !== next.cooperation_priority
  ) {
    changes.push(
      buildChange(
        'cooperation_updated',
        'Обновлён блок сотрудничества.',
        now,
        true,
      ),
    );
  }

  if (!areEqual(previous.crm, next.crm)) {
    changes.push(
      buildChange(
        'crm_updated',
        'Обновлены внутренние CRM-данные проекта.',
        now,
        false,
      ),
    );
  }

  if (changes.length === 0) {
    changes.push(
      buildChange(
        'updated',
        'Проект обновлён.',
        now,
        false,
      ),
    );
  }

  return changes;
}

export async function createProject(data: ProjectFormData) {
  const projects = await getProjects();

  const now = new Date().toISOString();

  const baseProject = normalizeProject({
    ...formDataToProjectData(data),
    id: uuidv4(),
    created_at: now,
    updated_at: now,
  });

  const initialChanges: ProjectChange[] = [
    buildChange('created', 'Проект создан.', now, true),
  ];

  if (baseProject.presentation_url) {
    initialChanges.push(
      buildChange(
        'presentation_uploaded',
        'Добавлена презентация проекта.',
        now,
        true,
      ),
    );
  }

  if ((baseProject.team_members?.length ?? 0) > 0 || (baseProject.team_open_roles?.length ?? 0) > 0) {
    initialChanges.push(
      buildChange(
        'team_updated',
        'Добавлена информация о команде.',
        now,
        true,
      ),
    );
  }

  if ((baseProject.readiness_items?.length ?? 0) > 0) {
    initialChanges.push(
      buildChange(
        'readiness_updated',
        'Заполнена готовность проекта.',
        now,
        true,
      ),
    );
  }

  if (
  (baseProject.cooperation_needs?.length ?? 0) > 0 ||
  baseProject.cooperation_offer ||
  baseProject.cooperation_priority !== 'later'
) {
    initialChanges.push(
      buildChange(
        'cooperation_updated',
        'Добавлен блок сотрудничества.',
        now,
        true,
      ),
    );
  }

  if (
  baseProject.crm?.owner ||
  baseProject.crm?.notes ||
  baseProject.crm?.next_action ||
  baseProject.crm?.last_contact_at
  ) {
    initialChanges.push(
      buildChange(
        'crm_updated',
        'Созданы внутренние CRM-данные проекта.',
        now,
        false,
      ),
    );
  }

  const project: Project = {
    ...baseProject,
    change_log: initialChanges,
  };

  projects.unshift(project);

  await saveProjects(projects);

  return project;
}

export async function updateProject(id: string, data: ProjectFormData) {
  const projects = await getProjects();

  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return null;
  }

  const previousProject = projects[index];
  const now = new Date().toISOString();
  const formProjectData = formDataToProjectData(data);

  const nextProjectBase = normalizeProject({
    ...previousProject,
    ...formProjectData,
    crm: {
      ...normalizeCRM(formProjectData.crm),
      bitrix_deal_id:
        formProjectData.crm?.bitrix_deal_id ||
        previousProject.crm?.bitrix_deal_id,
      bitrix_company_id:
        formProjectData.crm?.bitrix_company_id ||
        previousProject.crm?.bitrix_company_id,
    },
    id,
    created_at: previousProject.created_at,
    updated_at: now,
    change_log: previousProject.change_log,
  });

  const nextChanges = buildUpdateChanges(previousProject, nextProjectBase, now);

  const updatedProject: Project = {
    ...nextProjectBase,
    change_log: [...nextChanges, ...(previousProject.change_log || [])],
  };

  projects[index] = updatedProject;

  await saveProjects(projects);

  return updatedProject;
}

export async function setProjectBitrixDealId(
  id: string,
  bitrixDealId: number,
  bitrixCompanyId?: number,
) {
  const projects = await getProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) return null;

  const project = projects[index];
  const updatedProject: Project = {
    ...project,
    crm: {
      ...normalizeCRM(project.crm),
      bitrix_deal_id: bitrixDealId,
      bitrix_company_id: bitrixCompanyId ?? project.crm?.bitrix_company_id,
    },
  };

  projects[index] = updatedProject;
  await saveProjects(projects);

  return updatedProject;
}

export async function upsertProjectFromBitrix(data: ProjectFormData) {
  const projects = await getProjects();
  const bitrixDealId = data.crm?.bitrix_deal_id;
  const siteProjectId = data.crm?.notes?.match(/siteProjectId:([^\s]+)/)?.[1];
  const existingIndex = projects.findIndex((project) => {
    return (
      (siteProjectId && project.id === siteProjectId) ||
      (bitrixDealId && project.crm?.bitrix_deal_id === bitrixDealId)
    );
  });

  if (existingIndex >= 0) {
    const updatedProject = await updateProject(projects[existingIndex].id, data);
    return {
      project: updatedProject,
      created: false,
    };
  }

  const project = await createProject(data);

  return {
    project,
    created: true,
  };
}

export async function deleteProject(id: string) {
  const projects = await getProjects();

  const nextProjects = projects.filter((project) => project.id !== id);

  if (nextProjects.length === projects.length) {
    return false;
  }

  await saveProjects(nextProjects);

  return true;
}
