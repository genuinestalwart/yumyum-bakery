import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('getPing', () => {
		it('should return health check and uptime status', () => {
			const result = appController.getPing();

			expect(result).toEqual({
				status: 'ok',
				version: '0.0.1',
				// Matches any valid ISO string format
				timestamp: expect.stringMatching(
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
				),
				// Ensures uptime is a string and always ends with 's'
				uptime: expect.stringMatching(/s$/),
			});
		});
	});
});
