import { Body, Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ITokensPair } from './interfaces/tokens-pair.interface';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { User } from '../users/entities/user.entity';

@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	async signUp(@Body() newUser: SignUpDto): Promise<void> {
		await this.authService.signUp(newUser);
	}

	@HttpCode(HttpStatus.OK)
	@Post('signin')
	async signIn(@Body() user: SignInDto): Promise<ITokensPair> {
		return await this.authService.signIn(user);
	}

	@HttpCode(HttpStatus.OK)
	@Post('refresh-tokens')
	async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<ITokensPair> {
		return await this.authService.refreshTokens(refreshTokenDto);
	}

	@Auth(AuthType.Bearer)
	@Get('user')
	async getUser(@ActiveUser('sub') userId: string): Promise<User> {
		return await this.authService.getUser(userId);
	}
}
