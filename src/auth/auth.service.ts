import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { HashingService } from '../cryptography/hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { IActiveUserData } from './interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { ITokensPair } from './interfaces/tokens-pair.interface';
import { AuthError } from './auth.errors';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly hashingService: HashingService,
		private readonly jwtService: JwtService,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
		private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
	) {}

	async signUp(newUser: SignUpDto): Promise<void> {
		const oldUser = await this.userRepository.findOneBy({ username: newUser.username });

		if (oldUser) {
			throw AuthError.UsernameAlreadyTaken();
		}

		const passwordHash = await this.hashingService.hash(newUser.password);

		await this.userRepository.save({ ...newUser, passwordHash });
	}

	async signIn(user: SignInDto): Promise<ITokensPair> {
		const oldUser = await this.userRepository.findOneBy({ username: user.username });

		if (!oldUser) {
			throw AuthError.UserDoesNotExist();
		}

		const isEqual = await this.hashingService.compare(user.password, oldUser.passwordHash);

		if (!isEqual) {
			throw AuthError.PasswordDoesNotMatch();
		}

		return await this.generateTokens(oldUser);
	}

	private async generateTokens(user: User): Promise<ITokensPair> {
		const refreshTokenId = randomUUID();
		const [accessToken, refreshToken] = await Promise.all([
			this.signToken<Partial<IActiveUserData>>(user.id, this.jwtConfiguration.accessTokenTtl, {
				username: user.username,
			}),
			this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, { refreshTokenId }),
		]);

		await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

		return {
			accessToken,
			refreshToken,
		};
	}

	async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<ITokensPair> {
		try {
			const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
				Pick<IActiveUserData, 'sub'> & { refreshTokenId: string }
			>(refreshTokenDto.refreshToken, {
				secret: this.jwtConfiguration.secret,
				audience: this.jwtConfiguration.audience,
				issuer: this.jwtConfiguration.issuer,
			});

			const user = await this.userRepository.findOneByOrFail({
				id: sub,
			});
			const isValid = await this.refreshTokenIdsStorage.validate(user.id, refreshTokenId);

			if (isValid) {
				await this.refreshTokenIdsStorage.invalidate(user.id);
			} else {
				throw AuthError.RefreshTokenIsInvalid();
			}

			return await this.generateTokens(user);
		} catch (err) {
			if (err instanceof InvalidatedRefreshTokenError) {
				throw AuthError.UnauthorizedException('Access denied');
			}
			throw AuthError.UnauthorizedException();
		}
	}

	private async signToken<T>(userId: string, expiresIn: number, payload?: T): Promise<string> {
		return await this.jwtService.signAsync(
			{
				sub: userId,
				...payload,
			},
			{
				audience: this.jwtConfiguration.audience,
				issuer: this.jwtConfiguration.issuer,
				secret: this.jwtConfiguration.secret,
				expiresIn,
			},
		);
	}

	async getUser(userId: string): Promise<User> {
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) {
			throw AuthError.UserDoesNotExist();
		}
		return user;
	}
}
