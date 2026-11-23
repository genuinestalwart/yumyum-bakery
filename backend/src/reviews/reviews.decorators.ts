import {
	ApiCreateResource,
	ApiForbiddenAndUnauthorized,
} from 'src/common/decorators/swagger.decorators';
import {
	ReviewOfCustomerResponseDto,
	ReviewResponseDto,
} from './dto/review-response.dto';
import { ROLES } from 'src/common/types/roles.types';
import { ApiOkResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const ApiCreateReviewResource = () =>
	ApiCreateResource({
		description: `must be a ${ROLES.CUSTOMER.toUpperCase()}`,
		type: ReviewResponseDto,
	});

export const ApiFindProtectedManyReviewsResource = () => {
	return applyDecorators(
		ApiOkResponse({ type: [ReviewOfCustomerResponseDto] }),
		ApiForbiddenAndUnauthorized(),
	);
};
