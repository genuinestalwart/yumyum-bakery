import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { PublicMenuItemResponseDto } from './public-menu-item.response.dto';

export class ProtectedMenuItemResponseDto extends OmitType(
	PublicMenuItemResponseDto,
	['isArchived'] as const,
) {
	@ApiProperty({ format: 'date-time', nullable: true })
	archivedAt: Date | null;

	@ApiResponseProperty({ format: 'date-time' })
	createdAt: Date;

	@ApiProperty({ default: false, type: 'boolean' })
	isVisible: boolean;
}
