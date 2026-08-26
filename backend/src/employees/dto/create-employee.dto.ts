import {
	IsEmail,
	IsIn,
	IsLowercase,
	IsNotEmpty,
	IsString,
	MaxLength,
} from 'class-validator';
import {
	ToTrimmed,
	ToTrimmedLowerCase,
} from 'src/common/decorators/transform.decorators';
import { ASSIGNABLE_ROLES, type AssignableRole } from '../employees.types';

export class CreateEmployeeDto {
	@ToTrimmedLowerCase()
	@IsString()
	@IsLowercase()
	@IsEmail()
	@MaxLength(255)
	email: string;

	@ToTrimmed()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	name: string;

	@ToTrimmedLowerCase()
	@IsString()
	@IsIn(ASSIGNABLE_ROLES)
	role: AssignableRole;
}
