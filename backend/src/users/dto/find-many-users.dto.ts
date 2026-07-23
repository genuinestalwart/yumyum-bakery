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
import {
	StringToBoolean,
	TrimOnly,
	TrimToLowerCase,
	TrimToUpperCase,
} from 'src/common/decorators/transform.decorators';

export class FindManyUsersDto {
	@StringToBoolean()
	@IsOptional()
	@IsBoolean()
	blocked?: boolean;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	limit?: number = 20;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	page?: number = 1;

	@TrimToUpperCase()
	@IsOptional()
	@IsString()
	@IsIn(Object.values(ROLES))
	role?: Role;

	@TrimOnly()
	@IsOptional()
	@IsString()
	search?: string;

	@TrimToLowerCase()
	@IsOptional()
	@IsString()
	@IsIn(Object.values(SORT_BY))
	sortBy?: SortBy = SORT_BY.NAME;

	@TrimToLowerCase()
	@IsOptional()
	@IsString()
	@IsIn(Object.values(SORT_ORDER))
	sortOrder?: SortOrder = SORT_ORDER.ASC;
}
