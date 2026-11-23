import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { MenuCategoryResponseDto } from 'src/menu-categories/dto/menu-category-response.dto';

export class PublicMenuItemResponseDto {
	categories: MenuCategoryResponseDto[];

	@ApiResponseProperty({ type: 'string' })
	description: string;

	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiResponseProperty({ format: 'uri' })
	image: string;

	@ApiProperty({ maximum: 999, minimum: 0, type: 'integer' })
	inStock: number;

	@ApiProperty({ default: false, type: 'boolean' })
	isArchived: boolean;

	@ApiResponseProperty({ type: 'boolean' })
	isPreOrderOnly: boolean;

	@ApiResponseProperty({ type: 'string' })
	name: string;

	@ApiProperty({ minimum: 0, type: 'integer' })
	orderCount: number;

	@ApiProperty({ maximum: 1440, minimum: 0, type: 'integer' })
	prepTime: number;

	@ApiResponseProperty({ type: 'string' })
	price: string;

	@ApiProperty({ format: 'date-time', nullable: true })
	publishedAt: Date | null;

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: Date;
}
