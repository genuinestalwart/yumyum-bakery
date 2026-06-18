import crypto from 'crypto';

export const generatePassword = (length = 12): string => {
	const password = crypto
		.randomBytes(length)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.slice(0, length);

	return `${password}!1Aa`;
};
