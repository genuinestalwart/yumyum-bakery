import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToTrimmed } from 'src/common/decorators/transform.decorators';

export class AssignRiderDto {
	@ToTrimmed()
	@IsString()
	@IsNotEmpty()
	@MaxLength(250)
	riderId: string;
}
