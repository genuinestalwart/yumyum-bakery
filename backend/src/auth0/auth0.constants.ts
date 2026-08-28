import { ROLES, type Role } from 'src/common/types/roles.types';
export const AUTH0_ROLE_PREFIX = 'yyb_';
export const AUTH0_CONNECTION = process.env.AUTH0_CONNECTION as string;
export const AUTH0_IDENTIFIER = process.env.AUTH0_IDENTIFIER as string;
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID as string;
export const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET as string;
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN as string;

export const AUTH0_ROLE_IDS: Record<Role, string> = {
	[ROLES.ADMIN]: process.env.AUTH0_ROLE_ADMIN as string,
	[ROLES.CUSTOMER]: process.env.AUTH0_ROLE_CUSTOMER as string,
	[ROLES.MANAGER]: process.env.AUTH0_ROLE_MANAGER as string,
	[ROLES.STAFF]: process.env.AUTH0_ROLE_STAFF as string,
};
