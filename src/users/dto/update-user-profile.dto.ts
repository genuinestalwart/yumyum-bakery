import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';

export class UpdateUserProfileDto {
	@IsNotEmpty()
	@IsOptional()
	@IsString()
	@MaxLength(30)
	@TrimString()
	name?: string;

	@IsOptional()
	@IsUrl()
	@TrimString()
	picture?: string;
}
