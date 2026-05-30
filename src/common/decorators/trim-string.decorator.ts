import { Transform } from 'class-transformer';

export const TrimString = () =>
	Transform(({ value }) =>
		typeof value === 'string' ? value.trim() : value,
	);
