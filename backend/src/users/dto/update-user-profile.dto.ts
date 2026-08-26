import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { ToTrimmed } from 'src/common/decorators/transform.decorators';

export class UpdateUserProfileDto {
	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	name?: string;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsUrl()
	@MaxLength(2048)
	picture?: string;
}
