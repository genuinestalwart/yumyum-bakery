import crypto from 'crypto';
import { Role, ROLES } from 'src/common/types/roles.types';

export const checkIfHigherRole = (requester: Role, target: Role): boolean => {
	const { ADMIN, CUSTOMER, MANAGER, STAFF } = ROLES;
	const hierarchy = [CUSTOMER, STAFF, MANAGER, ADMIN] as const;

	return hierarchy.indexOf(requester) > hierarchy.indexOf(target)
		? true
		: false;
};

export const generatePassword = (length = 12): string => {
	const password = crypto
		.randomBytes(length)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.slice(0, length);

	return `${password}!1Aa`;
};
