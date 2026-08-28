import { IsIn } from 'class-validator';
import { ToTrimmedLowerCase } from 'src/common/decorators/transform.decorators';
import { ASSIGNABLE_ROLES, type AssignableRole } from '../employees.types';

export class UpdateEmployeeRoleDto {
	@ToTrimmedLowerCase()
	@IsIn(ASSIGNABLE_ROLES)
	role: AssignableRole;
}
