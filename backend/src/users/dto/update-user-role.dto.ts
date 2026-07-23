import { IsIn, IsString } from 'class-validator';
import { TrimToUpperCase } from 'src/common/decorators/transform.decorators';
import { ROLES, type Role } from 'src/common/types/roles.types';

export class UpdateUserRoleDto {
	@TrimToUpperCase()
	@IsString()
	@IsIn([ROLES.MANAGER, ROLES.STAFF])
	role: Extract<Role, 'manager' | 'staff'>;
}
