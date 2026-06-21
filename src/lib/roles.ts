// Single source of truth for the role + account-status taxonomy.

export type Role = 'admin' | 'editor' | 'reviewer' | 'publisher' | 'user';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'rejected';

/** Roles a member of the public is allowed to self-register as (never admin). */
export const PUBLIC_ROLES = ['editor', 'reviewer', 'publisher', 'user'] as const;
export type PublicRole = (typeof PUBLIC_ROLES)[number];

export function isPublicRole(value: string): value is PublicRole {
  return (PUBLIC_ROLES as readonly string[]).includes(value);
}

export interface RoleMeta {
  label: string;
  /** Registration-number prefix, e.g. EDT -> EDT-000001 */
  prefix: string;
  /** Where this role lands after login. */
  dashboard: string;
  description: string;
}

export const ROLE_META: Record<Role, RoleMeta> = {
  admin: {
    label: 'Administrator',
    prefix: 'ADM',
    dashboard: '/dashboard',
    description: 'Full system access and management.',
  },
  editor: {
    label: 'Editor',
    prefix: 'EDT',
    dashboard: '/editor/dashboard',
    description: 'Create, upload, edit and submit documents for review.',
  },
  reviewer: {
    label: 'Reviewer',
    prefix: 'REV',
    dashboard: '/reviewer/dashboard',
    description: 'Review documents, provide feedback and approve submissions.',
  },
  publisher: {
    label: 'Publisher',
    prefix: 'PUB',
    dashboard: '/publisher/dashboard',
    description: 'Publish approved documents after payment verification.',
  },
  user: {
    label: 'Reader',
    prefix: 'USR',
    dashboard: '/user/dashboard',
    description: 'Browse, purchase and access published documents.',
  },
};

export const ACCOUNT_STATUSES: AccountStatus[] = ['pending', 'active', 'suspended', 'rejected'];

export function dashboardFor(role: Role | null | undefined): string {
  return role ? ROLE_META[role].dashboard : '/login';
}

export function roleLabel(role: string | null | undefined): string {
  return role && role in ROLE_META ? ROLE_META[role as Role].label : 'User';
}
