import { IsBoolean, IsOptional } from 'class-validator';
import { StringToBoolean } from 'src/common/decorators/transform.decorators';
import { FindManyMenuItemsDto } from './find-many-menu-items.dto';

export class FindProtectedManyMenuItemsDto extends FindManyMenuItemsDto {
	@StringToBoolean()
	@IsOptional()
	@IsBoolean()
	isArchived?: boolean;

	@StringToBoolean()
	@IsOptional()
	@IsBoolean()
	isVisible?: boolean;
}
