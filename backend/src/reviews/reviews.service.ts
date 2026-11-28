import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindPublicManyReviewsDto } from './dto/find-public-many-reviews.dto';
import { SORT_ORDER } from 'src/common/types/sorting.types';
import { OrderStatus } from 'prisma/generated/enums';
import {
	ReviewOfCustomerResponseDto,
	MenuItemReviewResponseDto,
	ReviewResponseDto,
} from './dto/review-response.dto';
import { Prisma } from 'prisma/generated/client';
import { getSortOrder } from 'src/common/utils/sort-order.util';

@Injectable()
export class ReviewsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(
		customerId: string,
		dto: CreateReviewDto,
	): Promise<ReviewResponseDto> {
		if ((dto.menuItemId && dto.orderId) || (!dto.menuItemId && !dto.orderId)) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		if (dto.menuItemId) {
			const order = await this.prismaService.order.findFirst({
				where: {
					customerId,
					orderedItems: { some: { menuItemId: dto.menuItemId } },
					orderStatus: { in: [OrderStatus.DELIVERED, OrderStatus.PICKED_UP] },
				},
			});

			if (!order) {
				throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
			}
		}

		if (dto.orderId) {
			await this.ensureNotExpired(dto.orderId);
		}

		return this.prismaService.review.create({ data: { ...dto, customerId } });
	}

	async findProtectedMany(
		dto: FindPublicManyReviewsDto,
		customerId: string,
	): Promise<ReviewOfCustomerResponseDto[]> {
		return this.getReviews(dto, { customerId }, { customerId: true });
	}

	async findPublicManyOfMenuItems(
		dto: FindPublicManyReviewsDto,
		menuItemId: string,
	): Promise<MenuItemReviewResponseDto[]> {
		return this.getReviews(
			dto,
			{ menuItemId, orderId: null },
			{ menuItemId: true },
		);
	}

	async findPublicManyOfOrders(
		dto: FindPublicManyReviewsDto,
	): Promise<ReviewResponseDto[]> {
		return this.getReviews(dto, { menuItemId: null, orderId: { not: null } });
	}

	async findPublicOne(id: string): Promise<ReviewResponseDto> {
		return this.prismaService.review.findUniqueOrThrow({ where: { id } });
	}

	async update(
		customerId: string,
		dto: UpdateReviewDto,
		id: string,
	): Promise<ReviewResponseDto> {
		const { orderId } = await this.prismaService.review.findUniqueOrThrow({
			select: { orderId: true },
			where: { customerId, id },
		});

		if (orderId) {
			await this.ensureNotExpired(orderId);
		}

		return this.prismaService.review.update({
			data: dto,
			where: { customerId, id },
		});
	}

	async delete(customerId: string, id: string): Promise<void> {
		await this.prismaService.review.delete({ where: { customerId, id } });
	}

	private async ensureNotExpired(orderId: string): Promise<void> {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: { createdAt: true },
			where: { id: orderId },
		});

		if (Date.now() - order.createdAt.getTime() >= 604800000) {
			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}
	}

	private async getReviews(
		dto: FindPublicManyReviewsDto,
		where: Prisma.ReviewWhereInput,
		omit?: Prisma.ReviewOmit,
	): Promise<ReviewResponseDto[]> {
		return this.prismaService.review.findMany({
			omit,
			orderBy: { createdAt: getSortOrder(dto.sortOrder) },
			skip: dto.page ? (dto.page - 1) * (dto.limit ?? 20) : 0,
			take: dto.limit ?? 20,
			where,
		});
	}
}
