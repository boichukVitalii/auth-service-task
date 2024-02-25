/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SignInDto } from '../src/auth/dto/sign-in.dto';
import { SignUpDto } from '../src/auth/dto/sign-up.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import testDbConfig from '../src/db/config/test-db.config';
import { config } from 'dotenv';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { RedisModule } from '../src/redis/redis.module';
import { RefreshTokenIdsStorage } from '../src/auth/refresh-token-ids.storage';

config();

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

describe('[Feature] Auth - /auth', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRootAsync({
					imports: [ConfigModule.forFeature(testDbConfig)],
					inject: [testDbConfig.KEY],
					useFactory: (dbConfiguration: ConfigType<typeof testDbConfig>) => {
						return {
							type: 'postgres',
							host: dbConfiguration.host,
							port: dbConfiguration.port,
							username: dbConfiguration.username,
							password: dbConfiguration.password,
							database: dbConfiguration.database,
							autoLoadEntities: true,
							synchronize: true,
						};
					},
				}),
				RedisModule,
				UsersModule,
				AuthModule,
			],
			controllers: [],
			providers: [],
		}).compile();

		app = moduleFixture.createNestApplication();

		const httpAdapter = app.get(HttpAdapterHost);
		app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

		await app.init();
	});

	describe('Sign up', () => {
		it('/auth/signup (POST) - success', async () => {
			return await request(app.getHttpServer())
				.post('/auth/signup')
				.send(signUpUser)
				.expect(HttpStatus.CREATED);
		});

		it('/auth/signup (POST) - fail', async () => {
			return await request(app.getHttpServer())
				.post('/auth/signup')
				.send(signUpUser)
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe('Sign in', () => {
		it('/auth/signin (POST) - success', async () => {
			return await request(app.getHttpServer())
				.post('/auth/signin')
				.send(signInUser)
				.expect(HttpStatus.OK)
				.then(({ body }: request.Response) => {
					expect(body.accessToken).toBeTruthy();
					expect(body.refreshToken).toBeTruthy();
				});
		});

		it('/auth/signin (POST) - fail', async () => {
			return await request(app.getHttpServer())
				.post('/auth/signin')
				.send({ ...signInUser, password: 'wrong_password' })
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe('Sign in', () => {
		it('/auth/signin (POST) - success', async () => {
			return await request(app.getHttpServer())
				.post('/auth/signin')
				.send(signInUser)
				.expect(HttpStatus.OK)
				.then(({ body }: request.Response) => {
					expect(body.accessToken).toBeTruthy();
					expect(body.refreshToken).toBeTruthy();
				});
		});

		it('/auth/signin (POST) - fail', async () => {
			return await request(app.getHttpServer())
				.post('/auth/signin')
				.send({ ...signInUser, password: 'wrong_password' })
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe('Get user', () => {
		let accessToken;

		it('/auth/user (GET)', async () => {
			await request(app.getHttpServer())
				.post('/auth/signin')
				.send(signInUser)
				.then(({ body }: request.Response) => {
					accessToken = body.accessToken;
				});

			return await request(app.getHttpServer())
				.get('/auth/user')
				.set('Authorization', 'Bearer ' + accessToken)
				.expect(HttpStatus.OK)
				.then(({ body }: request.Response) => {
					expect(signInUser.username).toBe(body.username);
				});
		});
	});

	afterAll(async () => {
		await app.close();
	});
});
