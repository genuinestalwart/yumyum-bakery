import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	HttpCode,
	HttpStatus,
	ParseUUIDPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { type RequestedBy, ROLES } from 'src/common/types/roles.types';
import { Requester } from 'src/common/decorators/requester.decorator';
import { FindPublicManyReviewsDto } from './dto/find-public-many-reviews.dto';
import {
	ApiDeleteResource,
	ApiGlobalErrors,
	ApiNotFoundAndOk,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ApiCreateReviewResource } from './reviews.decorators';

@ApiGlobalErrors()
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@ApiCreateReviewResource()
	@ApiOperation({ summary: 'Create a new review' })
	@Post()
	@RequireRoles(ROLES.CUSTOMER)
	async create(
		@Body() body: CreateReviewDto,
		@Requester() requester: RequestedBy,
	): Promise<ReviewResponseDto> {
		return this.reviewsService.create(requester.id, body);
	}

	@ApiOkResponse({ type: [ReviewResponseDto] })
	@ApiOperation({ summary: 'Find many public reviews' })
	@Get()
	async findPublicMany(
		@Query() query: FindPublicManyReviewsDto,
	): Promise<ReviewResponseDto[]> {
		return this.reviewsService.findPublicManyOfOrders(query);
	}

	@ApiNotFoundAndOk({ type: ReviewResponseDto })
	@ApiOperation({ summary: 'Find a public review' })
	@Get(':id')
	async findPublicOne(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<ReviewResponseDto> {
		return this.reviewsService.findPublicOne(id);
	}

	@ApiOperation({ summary: 'Update a review' })
	@ApiUpdateResource({ type: ReviewResponseDto })
	@Patch(':id')
	@RequireRoles(ROLES.CUSTOMER)
	async update(
		@Body() body: UpdateReviewDto,
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<ReviewResponseDto> {
		return this.reviewsService.update(requester.id, body, id);
	}

	@ApiDeleteResource()
	@ApiOperation({ summary: 'Delete a review' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequireRoles(ROLES.CUSTOMER)
	async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<void> {
		await this.reviewsService.delete(requester.id, id);
	}
}
