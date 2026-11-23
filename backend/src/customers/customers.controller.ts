import {
	Controller,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
	Query,
	Get,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerEmailDto } from './dto/update-customer-email.dto';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { ROLES, type RequestedBy } from 'src/common/types/roles.types';
import { Requester } from 'src/common/decorators/requester.decorator';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	ApiDeleteAndConflict,
	ApiGlobalErrors,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';
import { ReviewsService } from 'src/reviews/reviews.service';
import { FindPublicManyReviewsDto } from 'src/reviews/dto/find-public-many-reviews.dto';
import { ReviewOfCustomerResponseDto } from 'src/reviews/dto/review-response.dto';
import { ApiFindProtectedManyReviewsResource } from 'src/reviews/reviews.decorators';

@ApiGlobalErrors()
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
	constructor(
		private readonly customersService: CustomersService,
		private readonly reviewsService: ReviewsService,
	) {}

	@ApiFindProtectedManyReviewsResource()
	@ApiOperation({ summary: 'Find many protected reviews of a CUSTOMER' })
	@Get('me/reviews')
	@RequireRoles(ROLES.CUSTOMER)
	async findProtectedManyReviews(
		@Query() query: FindPublicManyReviewsDto,
		@Requester() requester: RequestedBy,
	): Promise<ReviewOfCustomerResponseDto[]> {
		return this.reviewsService.findProtectedMany(query, requester.id);
	}

	@ApiOperation({ summary: "Update a CUSTOMER's email address" })
	@ApiUpdateResource({ type: ProtectedUserResponseDto })
	@Patch('me/email')
	@RequireRoles(ROLES.CUSTOMER)
	async updateEmail(
		@Body() body: UpdateCustomerEmailDto,
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		return this.customersService.updateEmail(body, requester.id);
	}

	@ApiOperation({ summary: 'Ban a CUSTOMER' })
	@ApiUpdateResource({ type: ProtectedUserResponseDto })
	@Patch(':id/ban')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async ban(@Param('id') id: string): Promise<ProtectedUserResponseDto> {
		return this.customersService.ban(id);
	}

	@ApiOperation({ summary: 'Unban a CUSTOMER' })
	@ApiUpdateResource({ type: ProtectedUserResponseDto })
	@Patch(':id/unban')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async unban(@Param('id') id: string): Promise<ProtectedUserResponseDto> {
		return this.customersService.unban(id);
	}

	@ApiDeleteAndConflict()
	@ApiOperation({ summary: 'Delete a CUSTOMER' })
	@Delete('me')
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequireRoles(ROLES.CUSTOMER)
	async delete(@Requester() requester: RequestedBy): Promise<void> {
		await this.customersService.delete(requester.id);
	}
}
