import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getPing() {
		const rawSecond = Math.floor(process.uptime());
		const day = Math.floor(rawSecond / 86400);
		const hour = Math.floor((rawSecond % 86400) / 3600);
		const minute = Math.floor((rawSecond % 3600) / 60);
		const second = rawSecond % 60;

		const uptime =
			`${day ? day + 'd ' : ''}${hour ? hour + 'h ' : ''}${minute ? minute + 'm ' : ''}${second}s`.trim();

		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime,
			version: '0.0.1',
		};
	}
}
