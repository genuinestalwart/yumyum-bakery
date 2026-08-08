import Auth0 from 'src/auth0/auth0.types';
import { AUTH0_ROLE_PREFIX } from 'src/auth0/auth0.constants';
import type { Role } from 'src/common/types/roles.types';

const extractRoleFromAppMetadata = (user: Auth0.UserResponseSchema) => {
	const roleInAppMetadata = (user.app_metadata?.role || '') as string;
	return roleInAppMetadata.slice(AUTH0_ROLE_PREFIX.length) as Role;
};

const serializeIdentities = (identities: Auth0.UserIdentity[]) => {
	return identities.map((identity) => ({
		id: identity.user_id as string,
		isSocial: identity.isSocial as boolean,
		provider: identity.provider as string,
	}));
};

export const serializeProtectedUser = (user: Auth0.UserResponseSchema) => {
	return {
		blocked: user.blocked as boolean,
		createdAt: user.created_at as string,
		email: user.email as string,
		emailVerified: user.email_verified as boolean,
		id: user.user_id as string,
		identities: serializeIdentities(user.identities as Auth0.UserIdentity[]),
		name: user.name as string,
		picture: user.picture as string,
		role: extractRoleFromAppMetadata(user),
		updatedAt: user.updated_at as string,
	};
};

export const serializePublicUser = (user: Auth0.UserResponseSchema) => {
	return {
		id: user.user_id as string,
		name: user.name as string,
		picture: user.picture as string,
		role: extractRoleFromAppMetadata(user),
	};
};
