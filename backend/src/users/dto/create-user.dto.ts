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
import { ROLES, type Role } from 'src/common/types/roles.types';

export class CreateUserDto {
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
	@IsIn([ROLES.MANAGER, ROLES.STAFF])
	role: Extract<Role, 'manager' | 'staff'>;
}
