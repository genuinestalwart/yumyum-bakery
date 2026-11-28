import { ApiResponseProperty } from '@nestjs/swagger';

export class LocationResponseDto {
	@ApiResponseProperty({ type: 'string' })
	deliveryCity: string;

	@ApiResponseProperty({ format: 'double' })
	deliveryLatitude: number;

	@ApiResponseProperty({ format: 'double' })
	deliveryLongitude: number;

	@ApiResponseProperty({ type: 'string' })
	deliveryPostalCode: string;

	@ApiResponseProperty({ type: 'string' })
	deliveryStreet: string;
}
