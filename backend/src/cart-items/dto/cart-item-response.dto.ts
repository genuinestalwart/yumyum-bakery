import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { MenuCategoryResponseDto } from 'src/menu-categories/dto/menu-category-response.dto';

export class CartItemResponseDto {
	categories: MenuCategoryResponseDto[];

	@ApiResponseProperty({ type: 'string' })
	customerId: string;

	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiResponseProperty({ format: 'uri' })
	image: string;

	@ApiProperty({ maximum: 999, minimum: 0, type: 'integer' })
	inStock: number;

	@ApiResponseProperty({ format: 'uuid' })
	menuItemId: string;

	@ApiResponseProperty({ type: 'string' })
	name: string;

	@ApiProperty({ minimum: 0.01, format: 'float', type: 'number' })
	price: number;

	@ApiProperty({ maximum: 999, minimum: 1, type: 'integer' })
	quantity: number;
}
