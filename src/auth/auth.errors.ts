import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../common/domain.error';

export class AuthError extends DomainError {
	constructor(name: string, message: string, httpStatus?: HttpStatus) {
		super(name, message, httpStatus);
	}

	public static UsernameAlreadyTaken(): AuthError {
		return new AuthError(
			'UsernameAlreadyTakenError',
			'The username has already been taken',
			HttpStatus.BAD_REQUEST,
		);
	}

	public static UserDoesNotExist(): AuthError {
		return new AuthError('UserDoesNotExist', 'User does not exist', HttpStatus.BAD_REQUEST);
	}

	public static PasswordDoesNotMatch(): AuthError {
		return new AuthError('PasswordDoesNotMatch', 'Password does not match', HttpStatus.BAD_REQUEST);
	}

	public static RefreshTokenIsInvalid(): AuthError {
		return new AuthError(
			'RefreshTokenIsInvalid',
			'Refresh token is invalid',
			HttpStatus.BAD_REQUEST,
		);
	}

	public static UnauthorizedException(message?: string): AuthError {
		const msg = message ?? 'Unauthorized exception';
		return new AuthError('UnauthorizedException', msg, HttpStatus.UNAUTHORIZED);
	}
}
