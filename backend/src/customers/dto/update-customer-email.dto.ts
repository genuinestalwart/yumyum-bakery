import { IsEmail, IsLowercase, IsString, MaxLength } from 'class-validator';
import { ToTrimmedLowerCase } from 'src/common/decorators/transform.decorators';

export class UpdateCustomerEmailDto {
	@ToTrimmedLowerCase()
	@IsString()
	@IsLowercase()
	@IsEmail()
	@MaxLength(255)
	email: string;
}
