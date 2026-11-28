import {
	IsLatitude,
	IsLongitude,
	IsNotEmpty,
	IsNumber,
	IsString,
	Max,
	MaxLength,
	Min,
} from 'class-validator';
import { ToTrimmed } from '../decorators/transform.decorators';

export class LocationDto {
	@ToTrimmed()
	@IsString()
	@IsNotEmpty()
	@MaxLength(250)
	deliveryStreet: string;

	@ToTrimmed()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	deliveryCity: string;

	@ToTrimmed()
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	deliveryPostalCode: string;

	@IsNumber()
	@Max(90)
	@Min(-90)
	@IsLatitude()
	deliveryLatitude: number;

	@IsNumber()
	@Max(180)
	@Min(-180)
	@IsLongitude()
	deliveryLongitude: number;
}
