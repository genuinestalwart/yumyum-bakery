import { SORT_ORDER, type SortOrder } from '../types/sorting.types';

export const getSortOrder = (sortOrder?: SortOrder) =>
	sortOrder ? SORT_ORDER[sortOrder] : SORT_ORDER.DESC;
