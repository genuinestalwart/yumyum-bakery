import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [InternalController],
	imports: [MenuItemsModule, UsersModule],
})
export class InternalModule {}
