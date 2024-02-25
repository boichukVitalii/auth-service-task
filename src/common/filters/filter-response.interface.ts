import { HttpStatus } from '@nestjs/common';

export interface IFilterResponse {
	statusCode: HttpStatus;
	message: string;
	method: string;
	path: string;
	timestamp: string;
}
