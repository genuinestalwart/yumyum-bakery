import { ApiCreateResource } from 'src/common/decorators/swagger.decorators';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ROLES } from 'src/common/types/roles.types';

export const ApiCreateReviewResource = () =>
	ApiCreateResource({
		description: `must be a ${ROLES.CUSTOMER.toUpperCase()}`,
		type: ReviewResponseDto,
	});
