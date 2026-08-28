import { IsBoolean, IsOptional } from 'class-validator';
import { QueryToBoolean } from 'src/common/decorators/transform.decorators';
import { FindManyMenuItemsDto } from './find-many-menu-items.dto';

export class FindProtectedManyMenuItemsDto extends FindManyMenuItemsDto {
	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isArchived?: boolean;

	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isVisible?: boolean;
}
