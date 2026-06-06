import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ClerkUser } from '../guards/clerk-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: keyof ClerkUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.clerkUser;
    return data ? user?.[data] : user;
  },
);
