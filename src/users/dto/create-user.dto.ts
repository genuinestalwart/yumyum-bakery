import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsString,
	MaxLength,
} from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';
import { ROLES, type Role } from 'src/common/types/roles.types';

export class CreateUserDto {
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	@TrimString()
	name: string;

	@IsNotEmpty()
	@IsIn([ROLES.MANAGER, ROLES.STAFF])
	role: Extract<Role, 'MANAGER' | 'STAFF'>;
}
