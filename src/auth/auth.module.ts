import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { RedisModule } from '../redis/redis.module';
import redisConfig from './config/redis.config';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.registerAsync(jwtConfig.asProvider()),
		ConfigModule.forFeature(jwtConfig),
		CryptographyModule,
		RedisModule.registerAsync({
			imports: [ConfigModule.forFeature(redisConfig)],
			inject: [redisConfig.KEY],
			useFactory: (redisConfiguration: ConfigType<typeof redisConfig>) => ({
				connectionOptions: {
					host: redisConfiguration.host,
					port: redisConfiguration.port,
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		{ provide: APP_GUARD, useClass: AuthenticationGuard },
		AccessTokenGuard,
		RefreshTokenIdsStorage,
		AuthService,
	],
})
export class AuthModule {}
