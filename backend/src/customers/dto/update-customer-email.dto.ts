import { IsEmail, IsString, MaxLength } from 'class-validator';
import { TrimToLowerCase } from 'src/common/decorators/transform.decorators';

export class UpdateCustomerEmailDto {
	@TrimToLowerCase()
	@IsString()
	@IsEmail()
	@MaxLength(255)
	email: string;
}
