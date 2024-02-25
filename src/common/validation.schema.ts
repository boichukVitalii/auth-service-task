import * as Joi from '@hapi/joi';

export const validationSchema = Joi.object({
	APP_PORT: Joi.number().default(3000),

	DATABASE_HOST: Joi.required(),
	DATABASE_PORT: Joi.number().default(5432),
	DATABASE_NAME: Joi.required(),
	DATABASE_USERNAME: Joi.required(),
	DATABASE_PASSWORD: Joi.required(),

	TEST_DATABASE_HOST: Joi.required(),
	TEST_DATABASE_PORT: Joi.number().default(5433),
	TEST_DATABASE_NAME: Joi.required(),
	TEST_DATABASE_USERNAME: Joi.required(),
	TEST_DATABASE_PASSWORD: Joi.required(),

	REDIS_HOST: Joi.required(),
	REDIS_PORT: Joi.number().default(6379),
	REDIS_PASSWORD: Joi.required(),

	JWT_SECRET: Joi.required(),
	JWT_TOKEN_AUDIENCE: Joi.required(),
	JWT_TOKEN_ISSUER: Joi.required(),
	JWT_ACCESS_TOKEN_TTL: Joi.number(),
	JWT_REFRESH_TOKEN_TTL: Joi.number(),
});
