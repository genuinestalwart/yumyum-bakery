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
	QueryToBoolean,
	ToTrimmed,
	ToTrimmedLowerCase,
} from 'src/common/decorators/transform.decorators';

export class FindProtectedManyUsersDto {
	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isBlocked?: boolean;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	limit?: number;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	page?: number;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(ROLES))
	role?: Role;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	search?: string;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(SORT_BY))
	sortBy?: SortBy;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(SORT_ORDER))
	sortOrder?: SortOrder;
}
