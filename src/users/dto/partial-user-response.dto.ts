import { IsIn, IsString, IsUrl } from 'class-validator';
import { ROLES, type Role } from 'src/common/types/roles.types';

export class PartialUserResponseDto {
	@IsString()
	id: string;

	@IsString()
	name: string;

	@IsUrl()
	picture: string;

	@IsIn(Object.values(ROLES))
	role: Role;
}
