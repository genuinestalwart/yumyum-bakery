import { ConflictException, Injectable } from '@nestjs/common';
import { MenuCategoryDto } from './dto/menu-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { createLogger } from 'src/common/utils/logger.util';

@Injectable()
export class MenuCategoriesService {
	constructor(private readonly prismaService: PrismaService) {}
	private readonly logger = createLogger(MenuCategoriesService.name);

	async create(dto: MenuCategoryDto): Promise<MenuCategoryResponseDto> {
		return this.prismaService.menuCategory.create({ data: dto });
	}

	async findPublicMany(): Promise<MenuCategoryResponseDto[]> {
		return this.prismaService.menuCategory.findMany({
			orderBy: { name: 'asc' },
		});
	}

	async update(
		dto: MenuCategoryDto,
		id: string,
	): Promise<MenuCategoryResponseDto> {
		return this.prismaService.menuCategory.update({ data: dto, where: { id } });
	}

	async delete(id: string): Promise<void> {
		const tiedToMenuItems = await this.prismaService.menuItem.count({
			where: { menuCategories: { some: { id } } },
		});

		if (tiedToMenuItems > 0) {
			this.logger.warn(`Menu Category is tied to some Menu Items | ID: ${id}`);
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		await this.prismaService.menuCategory.delete({ where: { id } });
	}
}
