import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@MinLength(8)
	password: string;

	@IsString()
	@IsNotEmpty()
	firstName: string;

	@IsString()
	@IsNotEmpty()
	lastName: string;
}
