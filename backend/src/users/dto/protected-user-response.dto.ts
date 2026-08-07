import { PublicUserResponseDto } from './public-user-response.dto';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class ProtectedUserIdentityDto {
	@ApiResponseProperty({ type: 'string' })
	id: string;

	@ApiResponseProperty({ type: 'boolean' })
	isSocial: boolean;

	@ApiResponseProperty({ type: 'string' })
	provider: string;
}

export class ProtectedUserResponseDto extends PublicUserResponseDto {
	@ApiProperty({ default: false, type: 'boolean' })
	blocked: boolean;

	@ApiResponseProperty({ format: 'date-time' })
	createdAt: string;

	@ApiResponseProperty({ format: 'email' })
	email: string;

	@ApiProperty({ default: true, type: 'boolean' })
	emailVerified: boolean;

	identities: ProtectedUserIdentityDto[];

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: string;
}
