import { ROLES } from 'src/common/types/roles.types';
export const ASSIGNABLE_ROLES = [ROLES.MANAGER, ROLES.STAFF] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
