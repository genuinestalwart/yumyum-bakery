import { IsIn, IsNotEmpty } from 'class-validator';
import { ROLES, type Role } from 'src/common/types/roles.types';

export class UpdateUserRoleDto {
	@IsNotEmpty()
	@IsIn([ROLES.MANAGER, ROLES.STAFF])
	role: Extract<Role, 'MANAGER' | 'STAFF'>;
}
