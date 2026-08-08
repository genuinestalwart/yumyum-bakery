import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { TrimOnly } from 'src/common/decorators/transform.decorators';

export class UpdateUserProfileDto {
	@TrimOnly()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	name?: string;

	@TrimOnly()
	@IsOptional()
	@IsString()
	@IsUrl()
	@MaxLength(2048)
	picture?: string;
}
