import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';
import { ROLES, type Role } from 'src/common/types/roles.types';
import { SORT_ORDER, type SortOrder } from 'src/common/types/sorting.types';
import { SORT_BY, type SortBy } from '../users.types';

export class FindManyUsersDto {
	@IsBoolean()
	@IsOptional()
	blocked?: boolean;

	@IsInt()
	@IsOptional()
	@Min(1)
	@Type(() => Number)
	limit?: number = 20;

	@IsInt()
	@IsOptional()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;

	@IsIn(Object.values(ROLES))
	@IsOptional()
	role?: Role;

	@IsOptional()
	@IsString()
	search?: string;

	@IsIn(Object.values(SORT_BY))
	@IsOptional()
	sort_by?: SortBy = SORT_BY.NAME;

	@IsIn(Object.values(SORT_ORDER))
	@IsOptional()
	sort_order?: SortOrder = SORT_ORDER.ASC;
}
