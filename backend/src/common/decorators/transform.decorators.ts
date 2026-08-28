import { Transform } from 'class-transformer';
type Sanitize = (value: string) => string;

const sanitizeCategoryName = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]/g, ' ') // 1. Replace all non-alphanumeric characters with spaces
		.replace(/\s+/g, ' ') // 2. Collapse multiple spaces into a single space
		.trim()
		.replace(/\s/g, '-'); // 3. Replace all remaining single spaces with a single hyphen

const parseQueryArray = (value: unknown) => {
	const list = Array.isArray(value) ? value : [value];

	if (list.every((item) => typeof item === 'string')) {
		return list.flatMap((item) => item.split(','));
	}

	return value;
};

const transformString = (sanitize: Sanitize) =>
	Transform(({ value }) => {
		return typeof value === 'string' ? sanitize(value) : value;
	});

export const BodyToCategoryName = () => transformString(sanitizeCategoryName);
export const ToTrimmed = () => transformString((value) => value.trim());
export const ToTrimmedLowerCase = () =>
	transformString((value) => value.trim().toLowerCase());
export const ToTrimmedUpperCase = () =>
	transformString((value) => value.trim().toUpperCase());

export const QueryToBoolean = () =>
	Transform(({ value }) => {
		return value === 'true' ? true : value === 'false' ? false : value;
	});

export const QueryToCategoryNames = () =>
	Transform(({ value }) => {
		const list = parseQueryArray(value);

		if (Array.isArray(list) && list.every((item) => typeof item === 'string')) {
			return list.map(sanitizeCategoryName).filter(Boolean);
		}

		return value;
	});
