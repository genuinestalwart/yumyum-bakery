// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig(
	{ ignores: ['eslint.config.mjs'] },
	eslint.configs.recommended,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			globals: { ...globals.node, ...globals.jest },
			sourceType: 'commonjs',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'prettier/prettier': ['error', { endOfLine: 'crlf' }],
		},
	},
);
