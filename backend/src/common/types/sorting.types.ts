export const SORT_ORDER = { ASC: 'asc', DESC: 'desc' } as const;
export type SortOrder = keyof typeof SORT_ORDER;
