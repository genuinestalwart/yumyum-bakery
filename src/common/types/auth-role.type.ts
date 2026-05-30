import { ROLES } from '../constants/roles';
export type AuthRole = (typeof ROLES)[keyof typeof ROLES];
