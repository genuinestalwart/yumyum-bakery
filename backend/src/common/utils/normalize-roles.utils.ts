import { AUTH0_ROLE_PREFIX } from '../../auth0/auth0.constants';

export const normalizeRoles = (givenRoles: string[]): string[] => {
	return givenRoles
		.filter((role) => role.startsWith(AUTH0_ROLE_PREFIX))
		.map((role) => role.slice(AUTH0_ROLE_PREFIX.length));
};
