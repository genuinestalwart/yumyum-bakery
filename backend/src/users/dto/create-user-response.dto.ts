import { IsIn } from 'class-validator';
import { ROLES, type Role } from 'src/common/types/roles.types';
import { FullUserResponseDto } from './full-user-response.dto';
import { OmitType } from '@nestjs/swagger';

export class CreateUserResponseDto extends OmitType(FullUserResponseDto, [
	'role',
] as const) {
	@IsIn([ROLES.MANAGER, ROLES.STAFF])
	role: Extract<Role, 'MANAGER' | 'STAFF'>;
}
