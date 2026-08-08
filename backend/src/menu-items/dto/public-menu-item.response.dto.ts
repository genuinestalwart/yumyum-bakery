import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { MenuCategoryResponseDto } from 'src/menu-categories/dto/menu-category-response.dto';

export class PublicMenuItemResponseDto {
	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiProperty({ default: false, type: 'boolean' })
	isArchived: boolean;

	categories: MenuCategoryResponseDto[];

	@ApiResponseProperty({ type: 'string' })
	description: string;

	@ApiResponseProperty({ format: 'uri' })
	image: string;

	@ApiProperty({ maximum: 999, minimum: 0, type: 'integer' })
	inStock: number;

	@ApiResponseProperty({ type: 'boolean' })
	isPreOrderOnly: boolean;

	@ApiResponseProperty({ type: 'string' })
	name: string;

	@ApiProperty({ minimum: 0, type: 'integer' })
	orderCount: number;

	@ApiProperty({ maximum: 1440, minimum: 0, type: 'integer' })
	prepTime: number;

	@ApiProperty({ minimum: 0.01, format: 'float', type: 'number' })
	price: number;

	@ApiProperty({ format: 'date-time', nullable: true })
	publishedAt: Date | null;

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: Date;
}
