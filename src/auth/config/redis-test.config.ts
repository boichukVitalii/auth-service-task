import { registerAs } from '@nestjs/config';

export default registerAs('redis-test', () => {
	return {
		host: process.env.TEST_REDIS_HOST,
		port: parseInt(process.env.TEST_REDIS_PORT, 10),
		password: process.env.TEST_REDIS_PASSWORD,
	};
});
