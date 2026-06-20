export const SORT_ORDER = {
	ASC: 'asc',
	DESC: 'desc',
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
