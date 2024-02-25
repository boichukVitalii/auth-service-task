/* eslint-disable @typescript-eslint/no-unused-vars */
import { HashingService } from '../../cryptography/hashing/hashing.service';

export class MockHashingService implements HashingService {
	async hash(data: string | Buffer): Promise<string> {
		return data.toString();
	}

	async compare(data: string | Buffer, encrypted: string): Promise<boolean> {
		return data.toString() === encrypted.toString();
	}
}
