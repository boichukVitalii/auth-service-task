/* eslint-disable @typescript-eslint/no-unused-vars */
export class JwtMockService {
	async signAsync(): Promise<string> {
		return 'token';
	}
}
