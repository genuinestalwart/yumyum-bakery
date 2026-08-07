import { IsIn, IsString } from 'class-validator';
import { TrimToLowerCase } from 'src/common/decorators/transform.decorators';
import { ROLES } from 'src/common/types/roles.types';
const ASSIGNABLE_ROLES = [ROLES.MANAGER, ROLES.STAFF] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class UpdateEmployeeRoleDto {
	@TrimToLowerCase()
	@IsString()
	@IsIn(ASSIGNABLE_ROLES)
	role: AssignableRole;
}
