import { Transform } from 'class-transformer';
type Normalize = (val: string) => string;

const normalizeStrings = (normalize: Normalize, value: any) => {
	if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
		return value.map((item) => normalize(item));
	}

	if (typeof value === 'string') {
		return normalize(value);
	}

	return value;
};

export const TrimOnly = () =>
	Transform(({ value }) =>
		normalizeStrings((val: string) => val.trim(), value),
	);

export const TrimToLowerCase = () =>
	Transform(({ value }) =>
		normalizeStrings((val: string) => val.trim().toLowerCase(), value),
	);

export const TrimToUpperCase = () =>
	Transform(({ value }) =>
		normalizeStrings((val: string) => val.trim().toUpperCase(), value),
	);

export const TrimToCategory = () =>
	Transform(({ value }) =>
		normalizeStrings(
			(val: string) =>
				val
					.toLowerCase()
					.replace(/[^a-z0-9]/g, ' ') // 1. Replace all non-alphanumeric characters with spaces
					.replace(/\s+/g, ' ') // 2. Collapse multiple spaces/hyphens into a single space
					.trim()
					.replace(/\s/g, '-'), // 3. Replace all remaining single spaces with a single hyphen
			value,
		),
	);

export const StringToBoolean = () =>
	Transform(({ value }) =>
		value === 'true' ? true : value === 'false' ? false : value,
	);
