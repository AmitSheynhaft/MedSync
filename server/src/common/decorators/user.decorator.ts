import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../types/entity-interfaces';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
