/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { HashingService } from '../cryptography/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { MockHashingService } from './mocks/mock-hashing.service';
import { RefreshTokenIdsStorageMock } from './mocks/refresh-token-ids-mock.storage';
import { JwtMockService } from './mocks/jwt-mock.service';
import { AuthError } from './auth.errors';
import { MockRepository, createMockRepository } from './mocks/mock.repository';

const signUpUser: SignUpDto = {
	username: 'test',
	password: 'test12345',
	firstName: 'first',
	lastName: 'last',
};

const createdUser = {
	id: 'sadioadji12',
	username: 'test',
	passwordHash: 'test12345',
	firstName: 'first',
	lastName: 'last',
};

const signInUser: SignInDto = {
	username: 'test',
	password: 'test12345',
};

describe('AuthService', () => {
	let service: AuthService;
	let userRepository: MockRepository;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: JwtService, useValue: new JwtMockService() },
				{ provide: jwtConfig.KEY, useValue: {} },
				{ provide: getRepositoryToken(User), useValue: createMockRepository() },
				{ provide: HashingService, useValue: new MockHashingService() },
				{ provide: RefreshTokenIdsStorage, useValue: new RefreshTokenIdsStorageMock() },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		userRepository = module.get<MockRepository>(getRepositoryToken(User));
		jest.clearAllMocks();
	});

	describe('signup', () => {
		it('should signup', async () => {
			await service.signUp(signUpUser);
		});

		it('should throw Username already taken', async () => {
			try {
				userRepository.findOneBy?.mockImplementation((user: SignInDto) =>
					Promise.resolve(createdUser),
				);
				await service.signUp(signUpUser);
			} catch (err) {
				expect(err).toBeInstanceOf(AuthError);
				expect(err.message).toBe('The username has already been taken');
			}
		});
	});

	describe('signin', () => {
		it('should signin', async () => {
			userRepository.findOneBy?.mockImplementation((user: SignInDto) =>
				Promise.resolve(createdUser),
			);

			const { accessToken, refreshToken } = await service.signIn(signInUser);

			expect(accessToken).toBeTruthy();
			expect(refreshToken).toBeTruthy();
		});

		it('should throw User does not exist', async () => {
			try {
				userRepository.findOneBy?.mockImplementation((user: SignInDto) => Promise.resolve(null));
				await service.signIn(signInUser);
			} catch (err) {
				expect(err).toBeInstanceOf(AuthError);
				expect(err.message).toBe('User does not exist');
			}
		});

		it('should throw Password does not match', async () => {
			try {
				userRepository.findOneBy?.mockImplementation((user: SignInDto) =>
					Promise.resolve({ ...createdUser, passwordHash: 'wrong' }),
				);
				await service.signIn(signInUser);
			} catch (err) {
				expect(err).toBeInstanceOf(AuthError);
				expect(err.message).toBe('Password does not match');
			}
		});
	});

	describe('get user', () => {
		it('should get user', async () => {
			userRepository.findOneBy?.mockImplementation(({ id: string }) =>
				Promise.resolve(createdUser),
			);

			const user = await service.getUser(createdUser.id);

			expect(user).toBeDefined();
			expect(user.id).toBe(createdUser.id);
		});

		it('should throw User does not exist', async () => {
			try {
				userRepository.findOneBy?.mockImplementation((user: SignInDto) => Promise.resolve(null));
				await service.getUser('wrong-id');
			} catch (err) {
				expect(err).toBeInstanceOf(AuthError);
				expect(err.message).toBe('User does not exist');
			}
		});
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
