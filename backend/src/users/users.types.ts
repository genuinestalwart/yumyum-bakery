export const SORT_BY = {
	CREATED_AT: 'created_at',
	EMAIL: 'email',
	NAME: 'name',
	UPDATED_AT: 'updated_at',
} as const;

export type SortBy = (typeof SORT_BY)[keyof typeof SORT_BY];
