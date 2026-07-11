import { ConflictException, Injectable } from '@nestjs/common';
import { MenuCategoryDto } from './dto/menu-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class MenuCategoriesService {
	constructor(private readonly prismaService: PrismaService) {}
	private readonly select: Prisma.MenuCategorySelect = { id: true, name: true };

	async createMenuCategory(
		dto: MenuCategoryDto,
	): Promise<MenuCategoryResponseDto> {
		return this.prismaService.menuCategory.create({
			data: dto,
			select: this.select,
		});
	}

	async findAllMenuCategories(): Promise<MenuCategoryResponseDto[]> {
		return this.prismaService.menuCategory.findMany({ select: this.select });
	}

	async updateMenuCategory(
		dto: MenuCategoryDto,
		id: string,
	): Promise<MenuCategoryResponseDto> {
		return this.prismaService.menuCategory.update({
			data: dto,
			where: { id },
			select: this.select,
		});
	}

	async deleteMenuCategory(id: string): Promise<void> {
		const categoryIsInUse = await this.prismaService.menuItem.count({
			where: { menu_categories: { some: { id } } },
		});

		if (categoryIsInUse) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		await this.prismaService.menuCategory.delete({ where: { id } });
	}
}
