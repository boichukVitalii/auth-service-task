import { Inject, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { IORedisKey } from '../redis/redis.module';

export class InvalidatedRefreshTokenError extends Error {}

export class RefreshTokenIdsStorage implements OnApplicationShutdown {
	constructor(@Inject(IORedisKey) public redisClient: Redis) {}

	async onApplicationShutdown(): Promise<string> {
		return await this.redisClient.quit();
	}

	async insert(userId: string, tokenId: string): Promise<void> {
		await this.redisClient.set(this.getKey(userId), tokenId);
	}

	async validate(userId: string, tokenId: string): Promise<boolean> {
		const storedId = await this.redisClient.get(this.getKey(userId));
		if (storedId !== tokenId) {
			throw new InvalidatedRefreshTokenError();
		}
		return storedId === tokenId;
	}

	async invalidate(userId: string): Promise<void> {
		await this.redisClient.del(this.getKey(userId));
	}

	private getKey(userId: string): string {
		return `user-${userId}`;
	}
}
