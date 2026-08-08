export const ROLES = {
	ADMIN: 'admin',
	CUSTOMER: 'customer',
	MANAGER: 'manager',
	STAFF: 'staff',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type RequestedBy = { id: string; role: Role };
