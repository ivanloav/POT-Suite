import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { JwtAuthGuard } from './jwt-auth.guard';

const createContext = (authorization?: string) => ({
  switchToHttp: () => ({
    getRequest: () => ({
      headers: authorization ? { authorization } : {},
    }),
  }),
});

describe('JwtAuthGuard', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('throws when token is missing', () => {
    const guard = new JwtAuthGuard();
    expect(() => guard.canActivate(createContext() as any)).toThrow(UnauthorizedException);
  });

  it('throws when token is invalid', () => {
    const guard = new JwtAuthGuard();
    const badToken = 'Bearer invalid.token.here';
    expect(() => guard.canActivate(createContext(badToken) as any)).toThrow(UnauthorizedException);
  });

  it('allows when token is valid', () => {
    const guard = new JwtAuthGuard();
    const token = jwt.sign(
      { userId: 1, email: 'test@example.com' },
      process.env.JWT_SECRET as string,
      {
        issuer: 'it-inventory',
        audience: 'it-inventory-client',
        algorithm: 'HS256',
        expiresIn: '1h',
      }
    );

    const result = guard.canActivate(createContext(`Bearer ${token}`) as any);
    expect(result).toBe(true);
  });
});
