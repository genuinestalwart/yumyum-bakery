import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsArray,
	IsInt,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';
import { QueryToArray } from 'src/common/decorators/transform.decorators';

export class FindPublicManyUsersDto {
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

	@QueryToArray()
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	userIds: string[];
}
