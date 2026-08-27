import { IsEmail, IsLowercase, MaxLength } from 'class-validator';
import { ToTrimmedLowerCase } from 'src/common/decorators/transform.decorators';

export class UpdateCustomerEmailDto {
	@ToTrimmedLowerCase()
	@IsEmail()
	@IsLowercase()
	@MaxLength(255)
	email: string;
}
