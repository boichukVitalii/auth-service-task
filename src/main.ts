import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

export const validationPipeOptions: ValidationPipeOptions = {
	whitelist: true,
	transform: true,
	forbidNonWhitelisted: true,
	stopAtFirstError: true,
};

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

	const httpAdapter = app.get(HttpAdapterHost);
	app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

	app.enableShutdownHooks();

	await app.listen(process.env.APP_PORT);
}
bootstrap();
