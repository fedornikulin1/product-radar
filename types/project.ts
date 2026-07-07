export type ProjectStatus = 'developing' | 'completed' | 'paused';

export type ProjectPrice = 'free' | 'freemium' | 'trial' | 'paid';

export type InvestmentStage =
  | 'pre_seed'
  | 'seed'
  | 'startup'
  | 'growth'
  | 'expansion'
  | 'exit';

export type AudienceType = 'b2b' | 'b2c' | 'b2g';
export type LegacyAudienceType = 'b2b_b2c';

export type PlacementType = 'saas' | 'on_premise';

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  telegram: string;
  linkedin: string;
};

export type ReadinessKey =
  | 'mvp'
  | 'pilot'
  | 'users'
  | 'revenue'
  | 'team'
  | 'deck'
  | 'unit_economics'
  | 'gtm'
  | 'legal';

export type CooperationNeed =
  | 'investment'
  | 'pilot'
  | 'cofounder'
  | 'mentor'
  | 'sales_partner'
  | 'tech_partner'
  | 'distribution_partner';

export type CooperationPriority = 'now' | 'soon' | 'later';

export type ProjectChangeType =
  | 'created'
  | 'updated'
  | 'presentation_uploaded'
  | 'materials_updated'
  | 'stage_changed'
  | 'team_updated'
  | 'readiness_updated'
  | 'cooperation_updated'
  | 'crm_updated';

export type ProjectChange = {
  id: string;
  created_at: string;
  type: ProjectChangeType;
  text: string;
  public: boolean;
};

export type CRMStatus =
  | 'draft'
  | 'internal_review'
  | 'ready_for_showcase'
  | 'archived';

export type CRMInternalPriority = 'low' | 'medium' | 'high';

export type ProjectCRM = {
  owner: string;
  priority: CRMInternalPriority;
  status: CRMStatus;
  notes: string;
  last_contact_at: string;
  next_action: string;
  show_public: boolean;
};

export type Project = {
  id: string;

  title: string;
  short_description: string;
  logo_url: string;

  categories: string[];
  price: ProjectPrice;

  link: string;
  telegram: string;
  contact_email: string;
  contact_phone: string;
  presentation_url: string;

  full_description: string;
  for_whom: string;
  problem: string;
  solution: string;
  advantages: string;
  cta: string;
  additional: string;

  gallery_urls: string[];
  video_url: string;

  team: string;
  technologies: string;

  status: ProjectStatus;
  investment_stage: InvestmentStage;

  /**
   * legacy поле для старых записей
   */
  audience_type?: AudienceType | LegacyAudienceType;

  /**
   * новая модель — мультивыбор
   */
  audience_types?: AudienceType[];

  /**
   * legacy поле для старых записей
   */
  placement_type?: PlacementType;

  /**
   * SaaS и/или On-premise
   */
  placement_types?: PlacementType[];

  community_statuses: string[];

  country: string;
  city: string;

  /**
   * Пакет 1
   */
  team_members?: TeamMember[];
  team_open_roles?: string[];

  readiness_items?: ReadinessKey[];
  readiness_score?: number;

  cooperation_needs?: CooperationNeed[];
  cooperation_offer?: string;
  cooperation_priority?: CooperationPriority;

  change_log?: ProjectChange[];
  crm?: ProjectCRM;

  created_at: string;
  updated_at: string;
};

export type ProjectFormData = {
  title: string;
  short_description: string;
  logo_url: string;

  categories: string[];
  price: ProjectPrice;

  link: string;
  telegram: string;
  contact_email: string;
  contact_phone: string;
  presentation_url: string;

  full_description: string;
  for_whom: string;
  problem: string;
  solution: string;
  advantages: string;
  cta: string;
  additional: string;

  gallery_urls: string[];
  video_url: string;

  team: string;
  technologies: string;

  status: ProjectStatus;
  investment_stage: InvestmentStage;

  audience_types: AudienceType[];
  placement_type?: PlacementType;
  placement_types: PlacementType[];

  community_statuses: string[];

  country: string;
  city: string;

  /**
   * Пакет 1
   */
  team_members?: TeamMember[];
  team_open_roles?: string[];

  readiness_items?: ReadinessKey[];
  readiness_score?: number;

  cooperation_needs?: CooperationNeed[];
  cooperation_offer?: string;
  cooperation_priority?: CooperationPriority;

  crm?: ProjectCRM;
};
