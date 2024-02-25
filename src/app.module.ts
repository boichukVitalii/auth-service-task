import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { CryptographyModule } from './cryptography/cryptography.module';
import { validationSchema } from './common/validation.schema';
import { RedisModule } from './redis/redis.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ['.env'],
			validationSchema,
		}),
		AuthModule,
		UsersModule,
		DbModule,
		CryptographyModule,
		RedisModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
