export const ROLES = {
	ADMIN: 'ADMIN',
	CUSTOMER: 'CUSTOMER',
	MANAGER: 'MANAGER',
	STAFF: 'STAFF',
} as const;

export type Role = keyof typeof ROLES;
export type RequestedBy = { id: string; role: Role };
