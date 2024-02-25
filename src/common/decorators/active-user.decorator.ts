import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../../auth/auth.constants';
import { IActiveUserData } from '../../auth/interfaces/active-user-data.interface';

export const ActiveUser = createParamDecorator(
	(field: keyof IActiveUserData | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user: IActiveUserData | undefined = request[REQUEST_USER_KEY];
		return field ? user?.[field] : user;
	},
);
