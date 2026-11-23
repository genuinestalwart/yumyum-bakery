import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { REGEX_VERIFICATION_CODE } from 'src/common/constants/regex.constants';
import { ToTrimmed } from 'src/common/decorators/transform.decorators';

export class FinishOrderDto {
	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Matches(REGEX_VERIFICATION_CODE)
	verificationCode?: string;
}
