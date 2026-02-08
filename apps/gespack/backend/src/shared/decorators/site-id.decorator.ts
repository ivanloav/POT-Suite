import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SiteId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.context?.siteId;
  },
);
