import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import dbConfig from './config/db.config';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule.forFeature(dbConfig)],
			inject: [dbConfig.KEY],
			useFactory: (dbConfiguration: ConfigType<typeof dbConfig>) => {
				return {
					type: 'postgres',
					host: dbConfiguration.host,
					port: dbConfiguration.port,
					username: dbConfiguration.username,
					password: dbConfiguration.password,
					database: dbConfiguration.database,
					// entities: ['dist/src/**/*.entity{.ts,.js}'],
					autoLoadEntities: true,
					// migrationsRun: true,
					logging: false,
					synchronize: true,
				};
			},
		}),
	],
})
export class DbModule {}
