import { ROLES, type Role } from 'src/common/types/roles.types';
export const AUTH0_ROLE_PREFIX = 'yyb_';
export const AUTH0_CONNECTION = process.env.AUTH0_CONNECTION!;
export const AUTH0_IDENTIFIER = process.env.AUTH0_IDENTIFIER!;
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
export const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;

export const AUTH0_ROLE_IDS: Record<Role, string> = {
	[ROLES.ADMIN]: process.env.AUTH0_ROLE_ADMIN!,
	[ROLES.CUSTOMER]: process.env.AUTH0_ROLE_CUSTOMER!,
	[ROLES.MANAGER]: process.env.AUTH0_ROLE_MANAGER!,
	[ROLES.STAFF]: process.env.AUTH0_ROLE_STAFF!,
};
