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
		isSocial: identity.isSocial!,
		provider: identity.provider,
	}));
};

export const serializeProtectedUser = (user: Auth0.UserResponseSchema) => {
	return {
		blocked: user.blocked!,
		createdAt: user.created_at!,
		email: user.email!,
		emailVerified: user.email_verified!,
		id: user.user_id!,
		identities: serializeIdentities(user.identities as Auth0.UserIdentity[]),
		name: user.name!,
		picture: user.picture!,
		role: extractRoleFromAppMetadata(user),
		updatedAt: user.updated_at!,
	};
};

export const serializePublicUser = (user: Auth0.UserResponseSchema) => {
	const { user_id, name, picture } = user;
	const role = extractRoleFromAppMetadata(user);
	return { id: user_id!, name: name!, picture: picture!, role };
};
