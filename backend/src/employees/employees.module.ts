import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Auth0Module } from 'src/auth0/auth0.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [EmployeesController],
	imports: [Auth0Module, UsersModule],
	providers: [EmployeesService],
})
export class EmployeesModule {}
