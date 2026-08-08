import { ApiResponseProperty } from '@nestjs/swagger';
import { ROLES, type Role } from 'src/common/types/roles.types';

export class PublicUserResponseDto {
	@ApiResponseProperty({ type: 'string' })
	id: string;

	@ApiResponseProperty({ type: 'string' })
	name: string;

	@ApiResponseProperty({ format: 'uri' })
	picture: string;

	@ApiResponseProperty({ enum: Object.values(ROLES) })
	role: Role;
}
