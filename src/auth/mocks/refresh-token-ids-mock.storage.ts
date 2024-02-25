export class InvalidatedRefreshTokenError extends Error {}

export class RefreshTokenIdsStorageMock {
	private redisClient = {};

	async insert(userId: string, tokenId: string): Promise<void> {
		this.redisClient[this.getKey(userId)] = tokenId;
	}

	async validate(userId: string, tokenId: string): Promise<boolean> {
		const storedId = this.redisClient[this.getKey(userId)];
		if (storedId !== tokenId) {
			throw new InvalidatedRefreshTokenError();
		}
		return storedId === tokenId;
	}

	async invalidate(userId: string): Promise<void> {
		delete this.redisClient[this.getKey(userId)];
	}

	private getKey(userId: string): string {
		return `user-${userId}`;
	}
}
