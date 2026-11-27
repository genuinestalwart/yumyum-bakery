export const SORT_BY = {
	NAME: 'name',
	POPULARITY: 'orderCount',
	PUBLISHED_AT: 'publishedAt',
	UPDATED_AT: 'updatedAt',
} as const;

export type SortBy = keyof typeof SORT_BY;
