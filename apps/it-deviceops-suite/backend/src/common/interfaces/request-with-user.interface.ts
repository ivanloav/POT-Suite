import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: number;
    userName?: string;
    email: string;
    roles: string[];
    permissions: string[];
    sites: Array<{
      siteId: number;
      code: string;
      name: string;
    }>;
  };
}
