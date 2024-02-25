import { registerAs } from '@nestjs/config';

export default registerAs('test-db', () => {
	return {
		host: process.env.TEST_DATABASE_HOST,
		port: parseInt(process.env.TEST_DATABASE_PORT, 10),
		username: process.env.TEST_DATABASE_USERNAME,
		password: process.env.TEST_DATABASE_PASSWORD,
		database: process.env.TEST_DATABASE_NAME,
	};
});
