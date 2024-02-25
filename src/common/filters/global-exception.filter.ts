import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NO_INFO_ABOUT_ERROR_MSG } from './filter.constants';
import { IFilterResponse } from './filter-response.interface';
import { DomainError } from '../domain.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();

		const httpStatus =
			exception instanceof DomainError
				? exception.httpStatus
				: exception instanceof HttpException
					? exception.getStatus()
					: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof Error
				? exception.message || NO_INFO_ABOUT_ERROR_MSG
				: NO_INFO_ABOUT_ERROR_MSG;

		const request = ctx.getRequest();
		const responseBody: IFilterResponse = {
			statusCode: httpStatus,
			message,
			method: request.method,
			path: httpAdapter.getRequestUrl(request),
			timestamp: new Date().toISOString(),
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
