import { Transform } from 'class-transformer';
type Sanitize = (val: string) => string;

const sanitizeCategory = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]/g, ' ') // 1. Replace all non-alphanumeric characters with spaces
		.replace(/\s+/g, ' ') // 2. Collapse multiple spaces into a single space
		.trim()
		.replace(/\s/g, '-'); // 3. Replace all remaining single spaces with a single hyphen

const sanitizeString = (sanitize: Sanitize, value: any) =>
	typeof value === 'string' ? sanitize(value) : value;

export const TrimOnly = () =>
	Transform(({ value }) => sanitizeString((val: string) => val.trim(), value));

export const TrimToLowerCase = () =>
	Transform(({ value }) =>
		sanitizeString((val: string) => val.trim().toLowerCase(), value),
	);

export const TrimToCategory = () =>
	Transform(({ value }) =>
		sanitizeString((val: string) => sanitizeCategory(val), value),
	);

/**
 * Custom `class-transformer` decorator to sanitize "category" query parameters.
 *
 * @returns Array of sanitized categories if value is a string or an array of strings;
 * otherwise, returns the unchanged value.
 */
export const QueryToCategory = () =>
	Transform(({ value }) => {
		if (Array.isArray(value)) {
			const categories = value.flatMap((cat) =>
				typeof cat === 'string' ? cat.split(',').map(sanitizeCategory) : cat,
			);

			return categories.filter(Boolean);
		}

		if (typeof value === 'string') {
			return value.split(',').map(sanitizeCategory).filter(Boolean);
		}

		return value;
	});

export const StringToBoolean = () =>
	Transform(({ value }) =>
		value === 'true' ? true : value === 'false' ? false : value,
	);
