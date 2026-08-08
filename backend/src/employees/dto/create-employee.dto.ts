import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsString,
	MaxLength,
} from 'class-validator';
import {
	TrimOnly,
	TrimToLowerCase,
} from 'src/common/decorators/transform.decorators';
import { ROLES } from 'src/common/types/roles.types';
const ASSIGNABLE_ROLES = [ROLES.MANAGER, ROLES.STAFF] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class CreateEmployeeDto {
	@TrimToLowerCase()
	@IsString()
	@IsEmail()
	@MaxLength(255)
	email: string;

	@TrimOnly()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	name: string;

	@TrimToLowerCase()
	@IsString()
	@IsIn(ASSIGNABLE_ROLES)
	role: AssignableRole;
}
