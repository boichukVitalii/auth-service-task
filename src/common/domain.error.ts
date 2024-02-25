import { HttpStatus } from '@nestjs/common';

export class DomainError extends Error {
	public readonly name: string;
	public readonly domain: boolean;
	public readonly httpStatus?: HttpStatus;

	constructor(name: string, message: string, httpStatus?: HttpStatus) {
		super(message);

		this.name = name;
		this.domain = true;
		this.httpStatus = httpStatus;
	}
}
