import { Logger } from '@nestjs/common';

export const createLogger = (context: string): Logger =>
	new Logger(context, { timestamp: true });
