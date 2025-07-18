import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (_, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.userId) throw new Error('Guard must be used');

    return request.user.userId;
  },
);
